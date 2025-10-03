const mongoose = require('mongoose');
const moment = require('moment');

const ProductionOrder = mongoose.model('ProductionOrder');

const summary = async (req, res) => {
  try {
    // Obter estatísticas gerais de ordens de produção
    const orderStats = await ProductionOrder.aggregate([
      { $match: { removed: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          plannedQuantity: { $sum: '$plannedQuantity' },
          producedQuantity: { $sum: '$producedQuantity' },
          rejectedQuantity: { $sum: '$rejectedQuantity' }
        }
      }
    ]);

    // Obter estatísticas de produção por período
    const thirtyDaysAgo = moment().subtract(30, 'days').toDate();
    const startOfMonth = moment().startOf('month').toDate();
    const startOfYear = moment().startOf('year').toDate();
    
    // Produção dos últimos 30 dias
    const last30DaysProduction = await ProductionOrder.aggregate([
      { 
        $match: { 
          removed: false,
          actualStartDate: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          plannedQuantity: { $sum: '$plannedQuantity' },
          producedQuantity: { $sum: '$producedQuantity' },
          rejectedQuantity: { $sum: '$rejectedQuantity' },
          materialCost: { $sum: '$costs.materialCost' },
          laborCost: { $sum: '$costs.laborCost' },
          overheadCost: { $sum: '$costs.overheadCost' },
          additionalCosts: { $sum: '$costs.additionalCosts' },
          totalCost: { $sum: '$costs.totalCost' }
        }
      }
    ]);
    
    // Produção do mês atual
    const currentMonthProduction = await ProductionOrder.aggregate([
      { 
        $match: { 
          removed: false,
          actualStartDate: { $gte: startOfMonth }
        } 
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          plannedQuantity: { $sum: '$plannedQuantity' },
          producedQuantity: { $sum: '$producedQuantity' },
          rejectedQuantity: { $sum: '$rejectedQuantity' },
          materialCost: { $sum: '$costs.materialCost' },
          laborCost: { $sum: '$costs.laborCost' },
          overheadCost: { $sum: '$costs.overheadCost' },
          additionalCosts: { $sum: '$costs.additionalCosts' },
          totalCost: { $sum: '$costs.totalCost' }
        }
      }
    ]);
    
    // Produção do ano atual
    const currentYearProduction = await ProductionOrder.aggregate([
      { 
        $match: { 
          removed: false,
          actualStartDate: { $gte: startOfYear }
        } 
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          plannedQuantity: { $sum: '$plannedQuantity' },
          producedQuantity: { $sum: '$producedQuantity' },
          rejectedQuantity: { $sum: '$rejectedQuantity' },
          materialCost: { $sum: '$costs.materialCost' },
          laborCost: { $sum: '$costs.laborCost' },
          overheadCost: { $sum: '$costs.overheadCost' },
          additionalCosts: { $sum: '$costs.additionalCosts' },
          totalCost: { $sum: '$costs.totalCost' }
        }
      }
    ]);

    // Obter ordens de produção em andamento
    const inProgressOrders = await ProductionOrder.find({ 
      removed: false,
      status: 'in_progress'
    })
    .select('number product billOfMaterial plannedQuantity producedQuantity rejectedQuantity plannedStartDate plannedEndDate actualStartDate')
    .populate('product')
    .populate('billOfMaterial')
    .sort({ actualStartDate: 1 })
    .limit(10);

    // Obter ordens de produção recentemente concluídas
    const completedOrders = await ProductionOrder.find({ 
      removed: false,
      status: 'completed'
    })
    .select('number product billOfMaterial plannedQuantity producedQuantity rejectedQuantity actualStartDate actualEndDate costs')
    .populate('product')
    .populate('billOfMaterial')
    .sort({ actualEndDate: -1 })
    .limit(10);

    // Formatar os resultados
    const formattedOrderStats = orderStats.map(stat => ({
      status: stat._id,
      count: stat.count,
      plannedQuantity: stat.plannedQuantity,
      producedQuantity: stat.producedQuantity,
      rejectedQuantity: stat.rejectedQuantity,
      efficiency: stat.producedQuantity > 0 ? 
        parseFloat(((stat.producedQuantity / (stat.producedQuantity + stat.rejectedQuantity)) * 100).toFixed(2)) : 0
    }));

    // Retornar os resultados
    return res.status(200).json({
      success: true,
      result: {
        orderStats: formattedOrderStats,
        periodStats: {
          last30Days: last30DaysProduction[0] || {
            count: 0,
            plannedQuantity: 0,
            producedQuantity: 0,
            rejectedQuantity: 0,
            totalCost: 0
          },
          currentMonth: currentMonthProduction[0] || {
            count: 0,
            plannedQuantity: 0,
            producedQuantity: 0,
            rejectedQuantity: 0,
            totalCost: 0
          },
          currentYear: currentYearProduction[0] || {
            count: 0,
            plannedQuantity: 0,
            producedQuantity: 0,
            rejectedQuantity: 0,
            totalCost: 0
          }
        },
        inProgressOrders,
        completedOrders
      },
      message: 'Resumo de produção obtido com sucesso',
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