const Device = require('../models/Device');
const SensorData = require('../models/SensorData');
const moment = require('moment');

// GET /devices - List all devices with their status
const getDevices = async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const devices = await Device
      .find(filter)
      .sort({ last_seen: -1 })
      .limit(parseInt(limit))
      .lean();

    // Add real-time status based on last_seen
    const devicesWithStatus = devices.map(device => {
      const oneHourAgo = moment().subtract(1, 'hour');
      const isActive = moment(device.last_seen).isAfter(oneHourAgo);
      
      return {
        ...device,
        isActive,
        timeSinceLastSeen: moment(device.last_seen).fromNow()
      };
    });

    res.json({
      count: devicesWithStatus.length,
      data: devicesWithStatus
    });

  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({
      error: 'Failed to fetch devices',
      message: error.message
    });
  }
};

// GET /devices/:sensor_id - Get specific device details
const getDeviceById = async (req, res) => {
  try {
    const { sensor_id } = req.params;

    const device = await Device.findOne({ sensor_id }).lean();

    if (!device) {
      return res.status(404).json({
        error: 'Device not found'
      });
    }

    // Get recent activity
    const recentData = await SensorData
      .find({ sensor_id })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    // Calculate device statistics
    const oneHourAgo = moment().subtract(1, 'hour');
    const oneDayAgo = moment().subtract(1, 'day');

    const hourlyData = await SensorData.aggregate([
      { $match: { sensor_id, timestamp: { $gte: oneHourAgo.toDate() } } },
      { $group: { _id: null, total_count: { $sum: '$count' }, data_points: { $sum: 1 } } }
    ]);

    const dailyData = await SensorData.aggregate([
      { $match: { sensor_id, timestamp: { $gte: oneDayAgo.toDate() } } },
      { $group: { _id: null, total_count: { $sum: '$count' }, data_points: { $sum: 1 } } }
    ]);

    const deviceWithStats = {
      ...device,
      isActive: moment(device.last_seen).isAfter(oneHourAgo),
      timeSinceLastSeen: moment(device.last_seen).fromNow(),
      recent_activity: recentData,
      statistics: {
        last_hour: {
          total_count: hourlyData[0]?.total_count || 0,
          data_points: hourlyData[0]?.data_points || 0
        },
        last_24_hours: {
          total_count: dailyData[0]?.total_count || 0,
          data_points: dailyData[0]?.data_points || 0
        }
      }
    };

    res.json(deviceWithStats);

  } catch (error) {
    console.error('Error fetching device by ID:', error);
    res.status(500).json({
      error: 'Failed to fetch device',
      message: error.message
    });
  }
};

// POST /devices - Create or update device
const createOrUpdateDevice = async (req, res) => {
  try {
    const { sensor_id, name, location, description } = req.body;

    if (!sensor_id || !name) {
      return res.status(400).json({
        error: 'sensor_id and name are required'
      });
    }

    const deviceData = {
      sensor_id,
      name,
      last_seen: new Date(),
      status: 'active'
    };

    if (location) {
      deviceData.location = {
        type: 'Point',
        coordinates: location.coordinates || [0, 0]
      };
    }

    if (description) {
      deviceData.description = description;
    }

    const device = await Device.findOneAndUpdate(
      { sensor_id },
      deviceData,
      { upsert: true, new: true }
    );

    res.status(201).json({
      message: 'Device created/updated successfully',
      data: device
    });

  } catch (error) {
    console.error('Error creating/updating device:', error);
    res.status(500).json({
      error: 'Failed to create/update device',
      message: error.message
    });
  }
};

// PUT /devices/:sensor_id/status - Update device status
const updateDeviceStatus = async (req, res) => {
  try {
    const { sensor_id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'maintenance'].includes(status)) {
      return res.status(400).json({
        error: 'Status must be active, inactive, or maintenance'
      });
    }

    const device = await Device.findOneAndUpdate(
      { sensor_id },
      { 
        status,
        last_seen: status === 'active' ? new Date() : device?.last_seen
      },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({
        error: 'Device not found'
      });
    }

    res.json({
      message: 'Device status updated successfully',
      data: device
    });

  } catch (error) {
    console.error('Error updating device status:', error);
    res.status(500).json({
      error: 'Failed to update device status',
      message: error.message
    });
  }
};

// GET /devices/status/summary - Get device status summary
const getDeviceStatusSummary = async (req, res) => {
  try {
    const summary = await Device.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const oneHourAgo = moment().subtract(1, 'hour');
    const activeDevices = await Device.countDocuments({
      last_seen: { $gte: oneHourAgo.toDate() }
    });

    const totalDevices = await Device.countDocuments();

    const statusSummary = {
      total: totalDevices,
      active: activeDevices,
      inactive: totalDevices - activeDevices,
      by_status: summary.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    res.json(statusSummary);

  } catch (error) {
    console.error('Error fetching device status summary:', error);
    res.status(500).json({
      error: 'Failed to fetch device status summary',
      message: error.message
    });
  }
};

module.exports = {
  getDevices,
  getDeviceById,
  createOrUpdateDevice,
  updateDeviceStatus,
  getDeviceStatusSummary
}; 