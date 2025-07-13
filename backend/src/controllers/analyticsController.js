const SensorData = require('../models/SensorData');
const moment = require('moment');

// GET /analytics - Return aggregated footfall data
const getAnalytics = async (req, res) => {
  try {
    const { period = 'hour', sensor_id, start_date, end_date } = req.query;

    let matchStage = {};
    let groupStage = {};

    // Add sensor filter if provided
    if (sensor_id) {
      matchStage.sensor_id = sensor_id;
    }

    // Add date range filter if provided
    if (start_date || end_date) {
      matchStage.timestamp = {};
      if (start_date) {
        matchStage.timestamp.$gte = new Date(start_date);
      }
      if (end_date) {
        matchStage.timestamp.$lte = new Date(end_date);
      }
    }

    // Default to last 24 hours if no date range provided
    if (!start_date && !end_date) {
      matchStage.timestamp = {
        $gte: moment().subtract(24, 'hours').toDate()
      };
    }

    if (period === 'hour') {
      groupStage = {
        _id: {
          sensor_id: '$sensor_id',
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' },
          hour: { $hour: '$timestamp' }
        },
        total_count: { $sum: '$count' },
        data_points: { $sum: 1 },
        avg_count: { $avg: '$count' },
        min_count: { $min: '$count' },
        max_count: { $max: '$count' }
      };
    } else if (period === 'day') {
      groupStage = {
        _id: {
          sensor_id: '$sensor_id',
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        },
        total_count: { $sum: '$count' },
        data_points: { $sum: 1 },
        avg_count: { $avg: '$count' },
        min_count: { $min: '$count' },
        max_count: { $max: '$count' }
      };
    }

    const analytics = await SensorData.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
    ]);

    // Format the results
    const formattedAnalytics = analytics.map(item => ({
      sensor_id: item._id.sensor_id,
      period: period === 'hour' ? 
        `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')} ${String(item._id.hour).padStart(2, '0')}:00` :
        `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
      total_count: item.total_count,
      data_points: item.data_points,
      avg_count: Math.round(item.avg_count * 100) / 100,
      min_count: item.min_count,
      max_count: item.max_count
    }));

    res.json({
      period,
      count: formattedAnalytics.length,
      data: formattedAnalytics
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
};

// GET /analytics/realtime - Get real-time data for the past hour
const getRealTimeAnalytics = async (req, res) => {
  try {
    const { sensor_id } = req.query;
    const oneHourAgo = moment().subtract(1, 'hour').toDate();

    const matchStage = {
      timestamp: { $gte: oneHourAgo }
    };

    if (sensor_id) {
      matchStage.sensor_id = sensor_id;
    }

    const realTimeData = await SensorData.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            sensor_id: '$sensor_id',
            minute: {
              $dateToString: {
                format: '%Y-%m-%d %H:%M',
                date: '$timestamp'
              }
            }
          },
          count: { $sum: '$count' }
        }
      },
      { $sort: { '_id.minute': 1 } }
    ]);

    // Format for chart data
    const chartData = {};
    realTimeData.forEach(item => {
      if (!chartData[item._id.sensor_id]) {
        chartData[item._id.sensor_id] = {
          labels: [],
          data: []
        };
      }
      chartData[item._id.sensor_id].labels.push(item._id.minute);
      chartData[item._id.sensor_id].data.push(item.count);
    });

    res.json({
      period: 'realtime',
      data: chartData
    });

  } catch (error) {
    console.error('Error fetching real-time analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch real-time analytics',
      message: error.message
    });
  }
};

// GET /analytics/summary - Get summary statistics
const getAnalyticsSummary = async (req, res) => {
  try {
    const { sensor_id } = req.query;
    const today = moment().startOf('day').toDate();
    const yesterday = moment().subtract(1, 'day').startOf('day').toDate();

    const matchStage = {
      timestamp: { $gte: today }
    };

    if (sensor_id) {
      matchStage.sensor_id = sensor_id;
    }

    const todayStats = await SensorData.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$sensor_id',
          total_count: { $sum: '$count' },
          data_points: { $sum: 1 },
          avg_count: { $avg: '$count' }
        }
      }
    ]);

    // Get yesterday's data for comparison
    const yesterdayMatchStage = {
      timestamp: { $gte: yesterday, $lt: today }
    };

    if (sensor_id) {
      yesterdayMatchStage.sensor_id = sensor_id;
    }

    const yesterdayStats = await SensorData.aggregate([
      { $match: yesterdayMatchStage },
      {
        $group: {
          _id: '$sensor_id',
          total_count: { $sum: '$count' },
          data_points: { $sum: 1 },
          avg_count: { $avg: '$count' }
        }
      }
    ]);

    // Calculate overall totals
    const todayTotal = todayStats.reduce((sum, stat) => sum + stat.total_count, 0);
    const yesterdayTotal = yesterdayStats.reduce((sum, stat) => sum + stat.total_count, 0);
    const changePercent = yesterdayTotal > 0 ? ((todayTotal - yesterdayTotal) / yesterdayTotal * 100) : 0;

    res.json({
      today: {
        total_count: todayTotal,
        sensor_count: todayStats.length,
        avg_per_sensor: todayStats.length > 0 ? Math.round(todayTotal / todayStats.length) : 0
      },
      yesterday: {
        total_count: yesterdayTotal,
        sensor_count: yesterdayStats.length,
        avg_per_sensor: yesterdayStats.length > 0 ? Math.round(yesterdayTotal / yesterdayStats.length) : 0
      },
      change_percent: Math.round(changePercent * 100) / 100,
      sensor_details: todayStats.map(stat => ({
        sensor_id: stat._id,
        total_count: stat.total_count,
        data_points: stat.data_points,
        avg_count: Math.round(stat.avg_count * 100) / 100
      }))
    });

  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics summary',
      message: error.message
    });
  }
};

module.exports = {
  getAnalytics,
  getRealTimeAnalytics,
  getAnalyticsSummary
}; 