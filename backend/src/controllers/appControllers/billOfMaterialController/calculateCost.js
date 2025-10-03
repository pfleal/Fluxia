const mongoose = require('mongoose');

const BillOfMaterial = mongoose.model('BillOfMaterial');
const Product = mongoose.model('Product');

const calculateCost = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar a ficha técnica
    const bom = await BillOfMaterial.findOne({ _id: id, removed: false });
    if (!bom) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Ficha técnica não encontrada',
      });
    }

    // Calcular o custo total da ficha técnica
    let totalCost = 0;
    let componentCosts = [];
    
    if (bom.components && bom.components.length > 0) {
      // Buscar todos os produtos componentes de uma vez
      const componentIds = bom.components.map(comp => comp.product);
      const componentProducts = await Product.find({ 
        _id: { $in: componentIds },
        removed: false 
      });
      
      // Criar um mapa para acesso rápido
      const productMap = {};
      componentProducts.forEach(prod => {
        productMap[prod._id.toString()] = prod;
      });
      
      // Calcular o custo de cada componente
      for (const component of bom.components) {
        const componentId = component.product.toString();
        const componentProduct = productMap[componentId];
        
        if (componentProduct) {
          const quantity = component.quantity;
          const unitCost = componentProduct.costPrice;
          const wastagePercentage = component.wastagePercentage || 0;
          
          // Calcular quantidade com desperdício
          const effectiveQuantity = quantity * (1 + wastagePercentage / 100);
          
          // Calcular custo do componente
          const componentCost = unitCost * effectiveQuantity;
          totalCost += componentCost;
          
          // Adicionar ao array de custos de componentes
          componentCosts.push({
            component: {
              _id: componentProduct._id,
              name: componentProduct.name,
              sku: componentProduct.sku
            },
            quantity,
            effectiveQuantity,
            unitCost,
            wastagePercentage,
            totalCost: componentCost
          });
        }
      }
    }
    
    // Adicionar custos adicionais
    let additionalCostsDetails = [];
    if (bom.additionalCosts && bom.additionalCosts.length > 0) {
      let baseCost = totalCost;
      
      for (const cost of bom.additionalCosts) {
        let costValue = 0;
        
        if (cost.type === 'fixed') {
          costValue = cost.value;
        } else if (cost.type === 'percentage') {
          costValue = (baseCost * cost.value) / 100;
        }
        
        totalCost += costValue;
        
        additionalCostsDetails.push({
          name: cost.name,
          type: cost.type,
          value: cost.value,
          calculatedValue: costValue
        });
      }
    }
    
    // Calcular o custo unitário
    const outputQuantity = bom.outputQuantity || 1;
    const unitCost = totalCost / outputQuantity;
    
    // Atualizar o custo na ficha técnica
    const updatedBOM = await BillOfMaterial.findOneAndUpdate(
      { _id: id },
      { 
        totalCost: parseFloat(totalCost.toFixed(2)),
        updated: Date.now() 
      },
      { new: true }
    );
    
    // Se for a ficha técnica padrão, atualizar o custo do produto
    if (bom.isDefault) {
      await Product.findOneAndUpdate(
        { _id: bom.product },
        { 
          costPrice: parseFloat(unitCost.toFixed(2)),
          updated: Date.now()
        }
      );
    }

    return res.status(200).json({
      success: true,
      result: {
        billOfMaterial: updatedBOM,
        costDetails: {
          componentCosts,
          additionalCostsDetails,
          materialCost: parseFloat(totalCost.toFixed(2)) - additionalCostsDetails.reduce((sum, cost) => sum + cost.calculatedValue, 0),
          additionalCost: additionalCostsDetails.reduce((sum, cost) => sum + cost.calculatedValue, 0),
          totalCost: parseFloat(totalCost.toFixed(2)),
          outputQuantity,
          unitCost: parseFloat(unitCost.toFixed(2))
        }
      },
      message: 'Custo calculado com sucesso',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
      error: error,
    });
  }
};

module.exports = calculateCost;