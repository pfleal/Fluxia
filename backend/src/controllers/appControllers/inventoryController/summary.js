const mongoose = require('mongoose');

const summary = async (req, res) => {
  try {
    const Model = mongoose.model('Inventory');
    const Product = mongoose.model('Product');
    const StockMovement = mongoose.model('StockMovement');

    // Estatísticas gerais do inventário
    const totalProducts = await Model.countDocuments({ removed: false });
    const activeProducts = await Model.countDocuments({ removed: false, status: 'active' });
    
    // Produtos com estoque baixo e sem estoque
    const lowStockCount = await Model.countDocuments({ 
      removed: false, 
      'alerts.lowStock': true 
    });
    
    const outOfStockCount = await Model.countDocuments({ 
      removed: false, 
      'alerts.outOfStock': true 
    });

    // Valor total do inventário
    const totalValueResult = await Model.aggregate([
      { $match: { removed: false } },
      { $group: { _id: null, totalValue: { $sum: '$totalValue' } } }
    ]);
    const totalInventoryValue = totalValueResult.length > 0 ? totalValueResult[0].totalValue : 0;

    // Movimentações dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentMovements = await StockMovement.countDocuments({
      removed: false,
      created: { $gte: thirtyDaysAgo }
    });

    // Movimentações por tipo nos últimos 30 dias
    const movementsByType = await StockMovement.aggregate([
      {
        $match: {
          removed: false,
          created: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    // Top 5 produtos com maior valor em estoque
    const topValueProducts = await Model.aggregate([
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
        $project: {
          productName: '$productInfo.name',
          sku: '$productInfo.sku',
          currentStock: 1,
          totalValue: 1
        }
      },
      { $sort: { totalValue: -1 } },
      { $limit: 5 }
    ]);

    // Análise por categoria
    const categoryStats = await Model.aggregate([
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
          count: { $sum: 1 },
          totalValue: { $sum: '$totalValue' },
          averageStock: { $avg: '$currentStock' }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);

    const result = {
      overview: {
        totalProducts,
        activeProducts,
        lowStockCount,
        outOfStockCount,
        totalInventoryValue: parseFloat(totalInventoryValue.toFixed(2)),
        recentMovements
      },
      movementsByType,
      topValueProducts,
      categoryStats,
      alerts: {
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
        criticalItems: lowStockCount + outOfStockCount
      }
    };

    return res.status(200).json({
      success: true,
      result,
      message: 'Resumo do inventário obtido com sucesso',
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