const mongoose = require('mongoose');
const Model = mongoose.model('Inventory');
const Product = mongoose.model('Product');
const StockMovement = mongoose.model('StockMovement');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const methods = createCRUDController('Inventory');

const summary = require('./summary');

// Endpoint para obter resumo do inventário
methods.summary = summary;

// Endpoint para obter níveis de estoque
methods['stock-levels'] = async (req, res) => {
  try {
    const inventoryItems = await Model.find({ removed: false })
      .populate('product', 'name sku category costPrice salePrice')
      .sort({ 'product.name': 1 });

    const stockLevels = inventoryItems.map(item => ({
      product: item.product,
      currentStock: item.currentStock,
      minimumStock: item.minimumStock,
      maximumStock: item.maximumStock,
      status: item.status,
      alerts: item.alerts,
      totalValue: item.totalValue,
      location: item.location
    }));

    return res.status(200).json({
      success: true,
      result: stockLevels,
      message: 'Níveis de estoque obtidos com sucesso',
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

// Endpoint para análise por categoria
methods['category-analysis'] = async (req, res) => {
  try {
    const categoryAnalysis = await Model.aggregate([
      { $match: { removed: false } },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          totalItems: { $sum: 1 },
          totalStock: { $sum: '$currentStock' },
          totalValue: { $sum: '$totalValue' },
          lowStockItems: {
            $sum: {
              $cond: ['$alerts.lowStock', 1, 0]
            }
          },
          outOfStockItems: {
            $sum: {
              $cond: ['$alerts.outOfStock', 1, 0]
            }
          }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);

    return res.status(200).json({
      success: true,
      result: categoryAnalysis,
      message: 'Análise por categoria obtida com sucesso',
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

// Endpoint para tendências de movimentação
methods['movement-trends'] = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const movements = await StockMovement.aggregate([
      {
        $match: {
          removed: false,
          created: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$created' } },
            type: '$type'
          },
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    return res.status(200).json({
      success: true,
      result: movements,
      message: 'Tendências de movimentação obtidas com sucesso',
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

// Endpoint para produtos mais movimentados
methods['top-products'] = async (req, res) => {
  try {
    const { limit = 10, days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const topProducts = await StockMovement.aggregate([
      {
        $match: {
          removed: false,
          created: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$product',
          totalMovements: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          inQuantity: {
            $sum: {
              $cond: ['$isIncrease', '$quantity', 0]
            }
          },
          outQuantity: {
            $sum: {
              $cond: ['$isIncrease', 0, '$quantity']
            }
          }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      { $sort: { totalMovements: -1 } },
      { $limit: parseInt(limit) }
    ]);

    return res.status(200).json({
      success: true,
      result: topProducts,
      message: 'Produtos mais movimentados obtidos com sucesso',
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

// Endpoint para alertas de estoque baixo
methods['low-stock-alerts'] = async (req, res) => {
  try {
    const lowStockItems = await Model.find({
      removed: false,
      $or: [
        { 'alerts.lowStock': true },
        { 'alerts.outOfStock': true }
      ]
    })
    .populate('product', 'name sku category')
    .sort({ currentStock: 1 });

    return res.status(200).json({
      success: true,
      result: lowStockItems,
      message: 'Alertas de estoque baixo obtidos com sucesso',
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

// Método para sincronizar inventário com produtos
methods.syncWithProducts = async (req, res) => {
  try {
    const products = await Product.find({ removed: false });
    let syncedCount = 0;
    let createdCount = 0;

    for (const product of products) {
      let inventoryItem = await Model.findOne({ product: product._id, removed: false });
      
      if (!inventoryItem) {
        // Criar novo item de inventário
        inventoryItem = new Model({
          product: product._id,
          currentStock: product.stock || 0,
          minimumStock: product.minimumStock || 0,
          maximumStock: product.maximumStock || 0,
          createdBy: req.admin._id,
        });
        await inventoryItem.save();
        createdCount++;
      } else {
        // Atualizar estoque atual baseado no produto
        inventoryItem.currentStock = product.stock || 0;
        inventoryItem.minimumStock = product.minimumStock || 0;
        inventoryItem.maximumStock = product.maximumStock || 0;
        inventoryItem.updated = Date.now();
        await inventoryItem.save();
        syncedCount++;
      }
    }

    return res.status(200).json({
      success: true,
      result: { syncedCount, createdCount },
      message: `Inventário sincronizado: ${createdCount} criados, ${syncedCount} atualizados`,
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

module.exports = methods;