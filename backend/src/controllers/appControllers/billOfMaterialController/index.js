const mongoose = require('mongoose');
const Model = mongoose.model('BillOfMaterial');
const Product = mongoose.model('Product');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const methods = createCRUDController('BillOfMaterial');

const calculateCost = require('./calculateCost');

// Sobrescrever o método create padrão
methods.create = async (req, res) => {
  try {
    // Verificar se o código já existe
    const existingCode = await Model.findOne({ code: req.body.code, removed: false });
    if (existingCode) {
      return res.status(400).json({
        success: false,
        result: null,
        message: `Ficha técnica com código ${req.body.code} já existe`,
      });
    }

    // Verificar se o produto existe
    const product = await Product.findOne({ _id: req.body.product, removed: false });
    if (!product) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Produto não encontrado',
      });
    }

    // Se esta ficha técnica for definida como padrão, desativar outras fichas padrão para o mesmo produto
    if (req.body.isDefault) {
      await Model.updateMany(
        { product: req.body.product, isDefault: true, removed: false },
        { isDefault: false }
      );
    }

    // Calcular o custo total da ficha técnica
    let totalCost = 0;
    
    if (req.body.components && req.body.components.length > 0) {
      // Buscar todos os produtos componentes de uma vez
      const componentIds = req.body.components.map(comp => comp.product);
      const componentProducts = await Product.find({ 
        _id: { $in: componentIds },
        removed: false 
      });
      
      // Criar um mapa para acesso rápido
      const productMap = {};
      componentProducts.forEach(prod => {
        productMap[prod._id.toString()] = prod;
      });
      
      // Calcular o custo total
      for (const component of req.body.components) {
        const componentProduct = productMap[component.product.toString()];
        if (componentProduct) {
          const componentCost = componentProduct.costPrice * component.quantity;
          totalCost += componentCost;
        }
      }
    }
    
    // Adicionar custos adicionais
    if (req.body.additionalCosts && req.body.additionalCosts.length > 0) {
      for (const cost of req.body.additionalCosts) {
        if (cost.type === 'fixed') {
          totalCost += cost.value;
        } else if (cost.type === 'percentage') {
          totalCost += (totalCost * cost.value) / 100;
        }
      }
    }
    
    // Calcular o custo unitário (dividir pelo outputQuantity)
    const outputQuantity = req.body.outputQuantity || 1;
    const unitCost = totalCost / outputQuantity;
    
    // Criar a ficha técnica com o custo calculado
    const result = await new Model({
      ...req.body,
      totalCost: parseFloat(totalCost.toFixed(2)),
      createdBy: req.admin._id,
    }).save();

    // Atualizar o custo do produto se esta for a ficha técnica padrão
    if (req.body.isDefault) {
      await Product.findOneAndUpdate(
        { _id: req.body.product },
        { 
          costPrice: parseFloat(unitCost.toFixed(2)),
          updated: Date.now()
        }
      );
    }

    return res.status(200).json({
      success: true,
      result,
      message: 'Ficha técnica criada com sucesso',
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

// Sobrescrever o método update padrão
methods.update = async (req, res) => {
  try {
    // Verificar se o código já existe em outra ficha técnica
    if (req.body.code) {
      const existingCode = await Model.findOne({ 
        code: req.body.code, 
        _id: { $ne: req.params.id },
        removed: false 
      });
      
      if (existingCode) {
        return res.status(400).json({
          success: false,
          result: null,
          message: `Ficha técnica com código ${req.body.code} já existe`,
        });
      }
    }

    // Buscar a ficha técnica atual
    const currentBOM = await Model.findOne({ _id: req.params.id, removed: false });
    if (!currentBOM) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Ficha técnica não encontrada',
      });
    }

    // Se esta ficha técnica for definida como padrão, desativar outras fichas padrão para o mesmo produto
    if (req.body.isDefault) {
      const productId = req.body.product || currentBOM.product;
      await Model.updateMany(
        { 
          product: productId, 
          _id: { $ne: req.params.id },
          isDefault: true, 
          removed: false 
        },
        { isDefault: false }
      );
    }

    // Calcular o custo total da ficha técnica atualizada
    let totalCost = 0;
    const components = req.body.components || currentBOM.components;
    const outputQuantity = req.body.outputQuantity || currentBOM.outputQuantity || 1;
    const productId = req.body.product || currentBOM.product;
    
    if (components && components.length > 0) {
      // Buscar todos os produtos componentes de uma vez
      const componentIds = components.map(comp => comp.product);
      const componentProducts = await Product.find({ 
        _id: { $in: componentIds },
        removed: false 
      });
      
      // Criar um mapa para acesso rápido
      const productMap = {};
      componentProducts.forEach(prod => {
        productMap[prod._id.toString()] = prod;
      });
      
      // Calcular o custo total
      for (const component of components) {
        const componentId = component.product.toString ? component.product.toString() : component.product;
        const componentProduct = productMap[componentId];
        if (componentProduct) {
          const componentCost = componentProduct.costPrice * component.quantity;
          totalCost += componentCost;
        }
      }
    }
    
    // Adicionar custos adicionais
    const additionalCosts = req.body.additionalCosts || currentBOM.additionalCosts;
    if (additionalCosts && additionalCosts.length > 0) {
      for (const cost of additionalCosts) {
        if (cost.type === 'fixed') {
          totalCost += cost.value;
        } else if (cost.type === 'percentage') {
          totalCost += (totalCost * cost.value) / 100;
        }
      }
    }
    
    // Calcular o custo unitário
    const unitCost = totalCost / outputQuantity;
    
    // Atualizar a ficha técnica com o custo calculado
    const result = await Model.findOneAndUpdate(
      { _id: req.params.id, removed: false },
      { 
        ...req.body, 
        totalCost: parseFloat(totalCost.toFixed(2)),
        updated: Date.now() 
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // Atualizar o custo do produto se esta for a ficha técnica padrão
    const isDefault = req.body.isDefault !== undefined ? req.body.isDefault : currentBOM.isDefault;
    if (isDefault) {
      await Product.findOneAndUpdate(
        { _id: productId },
        { 
          costPrice: parseFloat(unitCost.toFixed(2)),
          updated: Date.now()
        }
      );
    }

    return res.status(200).json({
      success: true,
      result,
      message: 'Ficha técnica atualizada com sucesso',
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

// Adicionar métodos personalizados
methods.calculateCost = calculateCost;

module.exports = methods;