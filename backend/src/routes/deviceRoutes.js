const express = require('express');
const router = express.Router();
const { 
  getDevices, 
  getDeviceById, 
  createOrUpdateDevice, 
  updateDeviceStatus, 
  getDeviceStatusSummary 
} = require('../controllers/deviceController');

// GET /devices - List all devices with their status
router.get('/', getDevices);

// GET /devices/status/summary - Get device status summary
router.get('/status/summary', getDeviceStatusSummary);

// GET /devices/:sensor_id - Get specific device details
router.get('/:sensor_id', getDeviceById);

// POST /devices - Create or update device
router.post('/', createOrUpdateDevice);

// PUT /devices/:sensor_id/status - Update device status
router.put('/:sensor_id/status', updateDeviceStatus);

module.exports = router; 