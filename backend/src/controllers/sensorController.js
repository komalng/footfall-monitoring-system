const SensorData = require('../models/SensorData');
const Device = require('../models/Device');

// POST /sensor-data - Accept footfall data from sensors
const postSensorData = async (req, res) => {
  try {
    const { sensor_id, timestamp, count } = req.body;

    // Validate required fields
    if (!sensor_id || count === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: sensor_id and count are required'
      });
    }

    // Validate count
    if (count < 0) {
      return res.status(400).json({
        error: 'Count must be a non-negative number'
      });
    }

    // Create sensor data entry
    const sensorData = new SensorData({
      sensor_id,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      count,
      location: {
        type: 'Point',
        coordinates: [0, 0] // Default coordinates, can be updated later
      }
    });

    await sensorData.save();

    // Update device last_seen timestamp
    await Device.findOneAndUpdate(
      { sensor_id },
      { 
        last_seen: new Date(),
        status: 'active'
      },
      { upsert: true, new: true }
    );

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('sensorDataUpdate', {
        sensor_id,
        timestamp: sensorData.timestamp,
        count,
        type: 'new_data'
      });
    }

    res.status(201).json({
      message: 'Sensor data recorded successfully',
      data: sensorData
    });

  } catch (error) {
    console.error('Error posting sensor data:', error);
    res.status(500).json({
      error: 'Failed to record sensor data',
      message: error.message
    });
  }
};

// GET /sensor-data - Get sensor data with optional filters
const getSensorData = async (req, res) => {
  try {
    const { sensor_id, start_date, end_date, limit = 100 } = req.query;

    const filter = {};

    if (sensor_id) {
      filter.sensor_id = sensor_id;
    }

    if (start_date || end_date) {
      filter.timestamp = {};
      if (start_date) {
        filter.timestamp.$gte = new Date(start_date);
      }
      if (end_date) {
        filter.timestamp.$lte = new Date(end_date);
      }
    }

    const sensorData = await SensorData
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      count: sensorData.length,
      data: sensorData
    });

  } catch (error) {
    console.error('Error fetching sensor data:', error);
    res.status(500).json({
      error: 'Failed to fetch sensor data',
      message: error.message
    });
  }
};

// GET /sensor-data/:sensor_id - Get data for specific sensor
const getSensorDataById = async (req, res) => {
  try {
    const { sensor_id } = req.params;
    const { limit = 100 } = req.query;

    const sensorData = await SensorData
      .find({ sensor_id })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();

    if (sensorData.length === 0) {
      return res.status(404).json({
        error: 'No data found for this sensor'
      });
    }

    res.json({
      sensor_id,
      count: sensorData.length,
      data: sensorData
    });

  } catch (error) {
    console.error('Error fetching sensor data by ID:', error);
    res.status(500).json({
      error: 'Failed to fetch sensor data',
      message: error.message
    });
  }
};

module.exports = {
  postSensorData,
  getSensorData,
  getSensorDataById
}; 