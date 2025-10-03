const mongoose = require('mongoose');
const moment = require('moment');

const StockMovement = mongoose.model('StockMovement');
const Product = mongoose.model('Product');

const summary = async (req, res) => {
  try {
    // Obter estatísticas gerais de movimentos de estoque
    const movementStats = await StockMovement.aggregate([
      { $match: { removed: false } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: '$totalCost' }
        }
      }
    ]);

    // Obter estatísticas de movimentos por período
    const thirtyDaysAgo = moment().subtract(30, 'days').toDate();
    const startOfMonth = moment().startOf('month').toDate();
    const startOfYear = moment().startOf('year').toDate();
    
    // Movimentos dos últimos 30 dias
    const last30DaysMovements = await StockMovement.aggregate([
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
          totalValue: { $sum: '$totalCost' }
        }
      }
    ]);
    
    // Movimentos do mês atual
    const currentMonthMovements = await StockMovement.aggregate([
      { 
        $match: { 
          removed: false,
          date: { $gte: startOfMonth }
        } 
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: '$totalCost' }
        }
      }
    ]);
    
    // Movimentos do ano atual
    const currentYearMovements = await StockMovement.aggregate([
      { 
        $match: { 
          removed: false,
          date: { $gte: startOfYear }
        } 
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: '$totalCost' }
        }
      }
    ]);

    // Obter produtos com maior movimentação
    const topMovedProducts = await StockMovement.aggregate([
      { $match: { removed: false } },
      {
        $group: {
          _id: '$product',
          totalMovements: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: '$totalCost' }
        }
      },
      { $sort: { totalMovements: -1 } },
      { $limit: 10 }
    ]);
    
    // Buscar informações dos produtos
    const productIds = topMovedProducts.map(item => item._id);
    const products = await Product.find({ _id: { $in: productIds } })
      .select('_id name sku type');
    
    // Criar um mapa para acesso rápido
    const productMap = {};
    products.forEach(product => {
      productMap[product._id.toString()] = product;
    });
    
    // Adicionar informações dos produtos aos resultados
    const topMovedProductsWithInfo = topMovedProducts.map(item => ({
      product: productMap[item._id.toString()],
      totalMovements: item.totalMovements,
      totalQuantity: item.totalQuantity,
      totalValue: parseFloat(item.totalValue.toFixed(2))
    }));

    // Obter movimentos recentes
    const recentMovements = await StockMovement.find({ removed: false })
      .sort({ date: -1 })
      .limit(10)
      .populate('product')
      .populate('createdBy');

    // Formatar os resultados
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
        movementStats: formattedMovementStats,
        periodStats: {
          last30Days: last30DaysMovements.map(stat => ({
            type: stat._id,
            count: stat.count,
            totalQuantity: stat.totalQuantity,
            totalValue: parseFloat(stat.totalValue.toFixed(2))
          })),
          currentMonth: currentMonthMovements.map(stat => ({
            type: stat._id,
            count: stat.count,
            totalQuantity: stat.totalQuantity,
            totalValue: parseFloat(stat.totalValue.toFixed(2))
          })),
          currentYear: currentYearMovements.map(stat => ({
            type: stat._id,
            count: stat.count,
            totalQuantity: stat.totalQuantity,
            totalValue: parseFloat(stat.totalValue.toFixed(2))
          }))
        },
        topMovedProducts: topMovedProductsWithInfo,
        recentMovements
      },
      message: 'Resumo de movimentos de estoque obtido com sucesso',
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