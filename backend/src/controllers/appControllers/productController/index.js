const mongoose = require('mongoose');
const Model = mongoose.model('Product');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const methods = createCRUDController('Product');

const summary = require('./summary');
const updateStock = require('./updateStock');

// Sobrescrever o método create padrão
methods.create = async (req, res) => {
  try {
    // Verificar se o SKU já existe
    const existingSku = await Model.findOne({ sku: req.body.sku, removed: false });
    if (existingSku) {
      return res.status(400).json({
        success: false,
        result: null,
        message: `Produto com SKU ${req.body.sku} já existe`,
      });
    }

    // Criar o novo produto
    const result = await new Model({
      ...req.body,
      createdBy: req.admin._id,
    }).save();

    return res.status(200).json({
      success: true,
      result,
      message: 'Produto criado com sucesso',
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
    // Verificar se o SKU já existe em outro produto
    if (req.body.sku) {
      const existingSku = await Model.findOne({ 
        sku: req.body.sku, 
        _id: { $ne: req.params.id },
        removed: false 
      });
      
      if (existingSku) {
        return res.status(400).json({
          success: false,
          result: null,
          message: `Produto com SKU ${req.body.sku} já existe`,
        });
      }
    }

    // Atualizar o produto
    const result = await Model.findOneAndUpdate(
      { _id: req.params.id, removed: false },
      { ...req.body, updated: Date.now() },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Produto não encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      result,
      message: 'Produto atualizado com sucesso',
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
methods.summary = summary;
methods.updateStock = updateStock;

module.exports = methods;