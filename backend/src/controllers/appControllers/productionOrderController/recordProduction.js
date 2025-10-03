const mongoose = require('mongoose');

const ProductionOrder = mongoose.model('ProductionOrder');
const Product = mongoose.model('Product');
const StockMovement = mongoose.model('StockMovement');

const recordProduction = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      quantity, 
      rejectedQuantity = 0, 
      notes 
    } = req.body;

    // Validar os dados de entrada
    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Quantidade produzida deve ser maior que zero',
      });
    }

    if (rejectedQuantity < 0) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Quantidade rejeitada não pode ser negativa',
      });
    }

    // Buscar a ordem de produção
    const order = await ProductionOrder.findOne({ 
      _id: id, 
      removed: false 
    }).populate('product');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Ordem de produção não encontrada',
      });
    }

    // Verificar se a ordem está em andamento
    if (order.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Ordem de produção não está em andamento',
      });
    }

    // Verificar se a quantidade total não excede a quantidade planejada
    const totalProduced = order.producedQuantity + quantity;
    
    if (totalProduced > order.plannedQuantity) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Quantidade total produzida excede a quantidade planejada',
      });
    }

    // Criar o registro de produção
    const productionEntry = {
      date: new Date(),
      quantity,
      rejectedQuantity,
      notes,
      recordedBy: req.admin._id
    };

    // Atualizar a ordem de produção
    const updatedOrder = await ProductionOrder.findOneAndUpdate(
      { _id: id },
      { 
        $push: { productionEntries: productionEntry },
        $inc: { 
          producedQuantity: quantity,
          rejectedQuantity: rejectedQuantity
        },
        updated: Date.now()
      },
      { new: true }
    );

    // Criar movimento de estoque para o produto produzido
    const year = new Date().getFullYear();
    
    // Obter o próximo número de movimento
    const lastMovement = await StockMovement.findOne({
      year: year,
    }).sort({ number: -1 });
    
    const nextNumber = lastMovement ? lastMovement.number + 1 : 1;
    
    // Atualizar o estoque do produto
    const product = order.product;
    const currentStock = product.stockQuantity;
    const newStock = currentStock + quantity;
    
    await Product.findOneAndUpdate(
      { _id: product._id },
      { 
        stockQuantity: newStock,
        updated: Date.now()
      }
    );
    
    // Criar o movimento de estoque
    const stockMovement = await new StockMovement({
      number: nextNumber,
      year: year,
      type: 'production',
      product: product._id,
      quantity,
      isIncrease: true,
      unitCost: product.costPrice,
      totalCost: product.costPrice * quantity,
      stockBefore: currentStock,
      stockAfter: newStock,
      notes: `Produção para OP #${order.number}/${order.year}`,
      relatedDocuments: {
        productionOrder: order._id
      },
      createdBy: req.admin._id,
    }).save();

    return res.status(200).json({
      success: true,
      result: {
        productionOrder: updatedOrder,
        productionEntry,
        stockMovement
      },
      message: 'Produção registrada com sucesso',
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

module.exports = recordProduction;