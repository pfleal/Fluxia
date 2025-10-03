const mongoose = require('mongoose');

const Product = mongoose.model('Product');
const StockMovement = mongoose.model('StockMovement');

const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      quantity, 
      type, 
      isIncrease, 
      notes, 
      lotNumber, 
      expiryDate, 
      location, 
      unitCost 
    } = req.body;

    // Validar os dados de entrada
    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Quantidade deve ser maior que zero',
      });
    }

    if (!type || !['purchase', 'production', 'sale', 'adjustment', 'transfer', 'return', 'waste'].includes(type)) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Tipo de movimento inválido',
      });
    }

    if (isIncrease === undefined || isIncrease === null) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Direção do movimento (isIncrease) é obrigatória',
      });
    }

    // Buscar o produto
    const product = await Product.findOne({ _id: id, removed: false });
    if (!product) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Produto não encontrado',
      });
    }

    // Calcular o novo estoque
    const currentStock = product.stockQuantity || 0;
    const newStock = isIncrease 
      ? currentStock + quantity 
      : currentStock - quantity;
    
    // Verificar se há estoque suficiente para saída
    if (!isIncrease && newStock < 0) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Estoque insuficiente para esta operação',
      });
    }

    // Calcular o custo total
    const totalCost = (unitCost || product.costPrice) * quantity;

    // Criar o movimento de estoque
    const year = new Date().getFullYear();
    
    // Obter o próximo número de movimento
    const lastMovement = await StockMovement.findOne({
      year: year,
    }).sort({ number: -1 });
    
    const nextNumber = lastMovement ? lastMovement.number + 1 : 1;

    // Criar o registro de movimento
    const stockMovement = await new StockMovement({
      number: nextNumber,
      year: year,
      type,
      product: id,
      quantity,
      isIncrease,
      unitCost: unitCost || product.costPrice,
      totalCost,
      lotNumber,
      expiryDate,
      sourceLocation: !isIncrease ? location : undefined,
      destinationLocation: isIncrease ? location : undefined,
      stockBefore: currentStock,
      stockAfter: newStock,
      notes,
      createdBy: req.admin._id,
    }).save();

    // Atualizar o estoque do produto
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id },
      { 
        stockQuantity: newStock,
        updated: Date.now()
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      result: {
        product: updatedProduct,
        stockMovement
      },
      message: 'Estoque atualizado com sucesso',
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

module.exports = updateStock;