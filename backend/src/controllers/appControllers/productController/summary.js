const mongoose = require('mongoose');
const moment = require('moment');

const Product = mongoose.model('Product');
const StockMovement = mongoose.model('StockMovement');

const summary = async (req, res) => {
  try {
    // Obter estatísticas gerais de produtos
    const productStats = await Product.aggregate([
      { $match: { removed: false } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalValue: { 
            $sum: { $multiply: ['$stockQuantity', '$costPrice'] } 
          },
          avgCost: { $avg: '$costPrice' },
          minStock: { $min: '$stockQuantity' },
          maxStock: { $max: '$stockQuantity' },
          totalStock: { $sum: '$stockQuantity' }
        }
      }
    ]);

    // Obter produtos com estoque abaixo do mínimo
    const lowStockProducts = await Product.aggregate([
      { $match: { removed: false, minStockQuantity: { $gt: 0 } } },
      { $match: { $expr: { $lt: ['$stockQuantity', '$minStockQuantity'] } } },
      { $project: { name: 1, sku: 1, stockQuantity: 1, minStockQuantity: 1, type: 1 } },
      { $sort: { stockQuantity: 1 } },
      { $limit: 10 }
    ]);

    // Obter produtos com maior valor em estoque
    const highValueProducts = await Product.find({ removed: false })
    .select('name sku stockQuantity costPrice type')
    .sort({ costPrice: -1 })
    .limit(10);

    // Obter movimentações recentes
    const recentMovements = await StockMovement.find({ removed: false })
    .sort({ date: -1 })
    .limit(10)
    .populate('product')
    .populate('createdBy');

    // Calcular estatísticas de movimentação por tipo nos últimos 30 dias
    const thirtyDaysAgo = moment().subtract(30, 'days').toDate();
    
    const movementStats = await StockMovement.aggregate([
      { 
        $match: { 
          removed: false,
          date: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$unitCost'] } }
        }
      }
    ]);

    // Formatar os resultados
    const formattedProductStats = productStats.map(stat => ({
      type: stat._id,
      count: stat.count,
      totalValue: parseFloat(stat.totalValue.toFixed(2)),
      avgCost: parseFloat(stat.avgCost.toFixed(2)),
      minStock: stat.minStock,
      maxStock: stat.maxStock,
      totalStock: stat.totalStock
    }));

    const formattedMovementStats = movementStats.map(stat => ({
      type: stat._id,
      count: stat.count,
      totalQuantity: stat.totalQuantity,
      totalValue: parseFloat(stat.totalValue.toFixed(2))
    }));

    // Retornar os resultados
    return res.status(200).json({
      success: true,
      result: {
        productStats: formattedProductStats,
        lowStockProducts,
        highValueProducts,
        recentMovements,
        movementStats: formattedMovementStats
      },
      message: 'Resumo de produtos obtido com sucesso',
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

module.exports = summary;