const express = require('express');
const router = express.Router();
const { postSensorData, getSensorData, getSensorDataById } = require('../controllers/sensorController');

// POST /sensor-data - Accept footfall data from sensors
router.post('/', postSensorData);

// GET /sensor-data - Get sensor data with optional filters
router.get('/', getSensorData);

// GET /sensor-data/:sensor_id - Get data for specific sensor
router.get('/:sensor_id', getSensorDataById);

module.exports = router; 