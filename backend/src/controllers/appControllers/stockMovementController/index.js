const mongoose = require('mongoose');
const Model = mongoose.model('StockMovement');
const Product = mongoose.model('Product');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const methods = createCRUDController('StockMovement');

const summary = require('./summary');

// Sobrescrever o método create padrão
methods.create = async (req, res) => {
  try {
    // Convert product ID to ObjectId if it's a string
    let productId;
    try {
      productId = mongoose.Types.ObjectId.isValid(req.body.product) 
        ? new mongoose.Types.ObjectId(req.body.product)
        : req.body.product;
    } catch (error) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'ID do produto inválido',
      });
    }

    // Verificar se o produto existe
    const product = await Product.findOne({ _id: productId, removed: false });
    if (!product) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Produto não encontrado',
      });
    }

    // Validar os dados de entrada
    if (!req.body.quantity || req.body.quantity <= 0) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Quantidade deve ser maior que zero',
      });
    }

    if (!req.body.type || !['purchase', 'production', 'sale', 'adjustment', 'transfer', 'return', 'waste'].includes(req.body.type)) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Tipo de movimento inválido',
      });
    }

    if (req.body.isIncrease === undefined || req.body.isIncrease === null) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Direção do movimento (isIncrease) é obrigatória',
      });
    }

    // Calcular o novo estoque
    const currentStock = product.stockQuantity || 0;
    const newStock = req.body.isIncrease 
      ? currentStock + req.body.quantity 
      : currentStock - req.body.quantity;
    
    // Verificar se há estoque suficiente para saída
    if (!req.body.isIncrease && newStock < 0) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Estoque insuficiente para esta operação',
      });
    }

    // Calcular o custo total
    const unitCost = req.body.unitCost || product.costPrice;
    const totalCost = unitCost * req.body.quantity;

    // Obter o próximo número de movimento
    const year = new Date().getFullYear();
    const lastMovement = await Model.findOne({
      year: year,
    }).sort({ number: -1 });
    
    const nextNumber = lastMovement ? lastMovement.number + 1 : 1;

    // Criar o movimento de estoque
    const result = await new Model({
      ...req.body,
      product: productId, // Use the converted ObjectId
      number: nextNumber,
      year: year,
      unitCost: unitCost,
      totalCost: totalCost,
      stockBefore: currentStock,
      stockAfter: newStock,
      createdBy: req.admin._id,
    }).save();

    // Atualizar o estoque do produto
    await Product.findOneAndUpdate(
      { _id: productId }, // Use the converted ObjectId
      { 
        stockQuantity: newStock,
        updated: Date.now()
      }
    );

    return res.status(200).json({
      success: true,
      result,
      message: 'Movimento de estoque criado com sucesso',
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

// Sobrescrever o método update padrão para impedir atualizações que afetariam o estoque
methods.update = async (req, res) => {
  try {
    // Buscar o movimento atual
    const currentMovement = await Model.findOne({ _id: req.params.id, removed: false });
    if (!currentMovement) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Movimento de estoque não encontrado',
      });
    }

    // Impedir alterações em campos críticos que afetariam o estoque
    const restrictedFields = ['product', 'quantity', 'isIncrease', 'stockBefore', 'stockAfter'];
    const requestedUpdates = Object.keys(req.body);
    
    const invalidUpdates = requestedUpdates.filter(update => restrictedFields.includes(update));
    
    if (invalidUpdates.length > 0) {
      return res.status(400).json({
        success: false,
        result: null,
        message: `Não é possível atualizar os campos ${invalidUpdates.join(', ')} em um movimento de estoque existente`,
      });
    }

    // Permitir apenas atualizações em campos não críticos
    const result = await Model.findOneAndUpdate(
      { _id: req.params.id, removed: false },
      { ...req.body, updated: Date.now() },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      result,
      message: 'Movimento de estoque atualizado com sucesso',
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

// Sobrescrever o método delete padrão para impedir exclusões que afetariam o estoque
methods.delete = async (req, res) => {
  try {
    // Buscar o movimento
    const movement = await Model.findOne({ _id: req.params.id, removed: false });
    if (!movement) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Movimento de estoque não encontrado',
      });
    }

    // Impedir a exclusão de movimentos de estoque
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Não é possível excluir movimentos de estoque. Para corrigir um erro, crie um movimento de ajuste.',
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

module.exports = methods;