const mongoose = require('mongoose');
const moment = require('moment');

const Quality = mongoose.model('Quality');
const ProductionOrder = mongoose.model('ProductionOrder');

const summary = async (req, res) => {
  try {
    // Get overall quality statistics
    const qualityStats = await Quality.aggregate([
      { $match: { removed: false } },
      {
        $group: {
          _id: null,
          avgQualityRate: { $avg: '$qualityRate' },
          avgDefectRate: { $avg: '$defectRate' },
          avgReworkRate: { $avg: '$reworkRate' },
          totalComplaints: { $sum: '$customerComplaints' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get quality trends for the last 12 months
    const twelveMonthsAgo = moment().subtract(12, 'months').toDate();
    const qualityTrends = await Quality.aggregate([
      { $match: { removed: false, created: { $gte: twelveMonthsAgo } } },
      { $unwind: '$qualityTrends' },
      {
        $group: {
          _id: {
            month: { $month: '$qualityTrends.date' },
            year: { $year: '$qualityTrends.date' }
          },
          avgQualityRate: { $avg: '$qualityTrends.qualityRate' },
          avgDefectRate: { $avg: '$qualityTrends.defectRate' },
          totalUnitsProduced: { $sum: '$qualityTrends.unitsProduced' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get recent quality records
    const recentQualityRecords = await Quality.find({ removed: false })
      .sort({ created: -1 })
      .limit(10)
      .populate('createdBy', 'name email')
      .select('qualityRate defectRate reworkRate customerComplaints created');

    // Calculate production quality metrics from production orders
    const productionQualityStats = await ProductionOrder.aggregate([
      { $match: { removed: false, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalProduced: { $sum: '$quantityProduced' },
          totalOrders: { $sum: 1 },
          avgProductionTime: { $avg: '$actualProductionTime' }
        }
      }
    ]);

    // Get quality performance by month for the last 6 months
    const sixMonthsAgo = moment().subtract(6, 'months').toDate();
    const monthlyQualityPerformance = await Quality.aggregate([
      { $match: { removed: false, created: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            month: { $month: '$created' },
            year: { $year: '$created' }
          },
          avgQualityRate: { $avg: '$qualityRate' },
          avgDefectRate: { $avg: '$defectRate' },
          totalComplaints: { $sum: '$customerComplaints' },
          recordCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Prepare response data
    const result = {
      overview: {
        avgQualityRate: qualityStats[0]?.avgQualityRate || 95,
        avgDefectRate: qualityStats[0]?.avgDefectRate || 2.5,
        avgReworkRate: qualityStats[0]?.avgReworkRate || 1.8,
        totalComplaints: qualityStats[0]?.totalComplaints || 0,
        totalRecords: qualityStats[0]?.count || 0
      },
      trends: qualityTrends,
      recentRecords: recentQualityRecords,
      productionStats: productionQualityStats[0] || {
        totalProduced: 0,
        totalOrders: 0,
        avgProductionTime: 0
      },
      monthlyPerformance: monthlyQualityPerformance
    };

    return res.status(200).json({
      success: true,
      result,
      message: 'Quality summary retrieved successfully',
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