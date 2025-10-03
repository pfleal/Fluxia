const mongoose = require('mongoose');

const ProductionOrder = mongoose.model('ProductionOrder');
const Product = mongoose.model('Product');
const StockMovement = mongoose.model('StockMovement');

const startProduction = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar a ordem de produção
    const order = await ProductionOrder.findOne({ 
      _id: id, 
      removed: false 
    }).populate('materialConsumption.product');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Ordem de produção não encontrada',
      });
    }

    // Verificar se a ordem já foi iniciada
    if (order.status === 'in_progress' || order.status === 'completed') {
      return res.status(400).json({
        success: false,
        result: null,
        message: `Ordem de produção já está ${order.status === 'in_progress' ? 'em andamento' : 'concluída'}`,
      });
    }

    // Verificar se há estoque suficiente de todos os materiais
    const insufficientMaterials = [];
    
    for (const material of order.materialConsumption) {
      const product = material.product;
      
      if (product.stockQuantity < material.plannedQuantity) {
        insufficientMaterials.push({
          product: {
            _id: product._id,
            name: product.name,
            sku: product.sku
          },
          required: material.plannedQuantity,
          available: product.stockQuantity,
          missing: material.plannedQuantity - product.stockQuantity
        });
      }
    }
    
    if (insufficientMaterials.length > 0) {
      return res.status(400).json({
        success: false,
        result: {
          insufficientMaterials
        },
        message: 'Estoque insuficiente para iniciar a produção',
      });
    }

    // Iniciar a produção
    const actualStartDate = new Date();
    
    // Atualizar a ordem de produção
    const updatedOrder = await ProductionOrder.findOneAndUpdate(
      { _id: id },
      { 
        status: 'in_progress',
        actualStartDate,
        updated: Date.now()
      },
      { new: true }
    );

    // Criar movimentos de estoque para consumo de materiais
    const stockMovements = [];
    const year = new Date().getFullYear();
    
    // Obter o próximo número de movimento
    const lastMovement = await StockMovement.findOne({
      year: year,
    }).sort({ number: -1 });
    
    let nextNumber = lastMovement ? lastMovement.number + 1 : 1;
    
    // Criar movimentos de estoque para cada material
    for (const material of order.materialConsumption) {
      const product = material.product;
      const quantity = material.plannedQuantity;
      
      // Atualizar o estoque do produto
      const currentStock = product.stockQuantity;
      const newStock = currentStock - quantity;
      
      await Product.findOneAndUpdate(
        { _id: product._id },
        { 
          stockQuantity: newStock,
          updated: Date.now()
        }
      );
      
      // Criar o movimento de estoque
      const stockMovement = await new StockMovement({
        number: nextNumber++,
        year: year,
        type: 'production',
        product: product._id,
        quantity,
        isIncrease: false,
        unitCost: product.costPrice,
        totalCost: product.costPrice * quantity,
        stockBefore: currentStock,
        stockAfter: newStock,
        notes: `Consumo para OP #${order.number}/${order.year}`,
        relatedDocuments: {
          productionOrder: order._id
        },
        createdBy: req.admin._id,
      }).save();
      
      stockMovements.push(stockMovement);
    }

    return res.status(200).json({
      success: true,
      result: {
        productionOrder: updatedOrder,
        stockMovements
      },
      message: 'Produção iniciada com sucesso',
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

module.exports = startProduction;