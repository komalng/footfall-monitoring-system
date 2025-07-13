const express = require('express');
const router = express.Router();
const { getAnalytics, getRealTimeAnalytics, getAnalyticsSummary } = require('../controllers/analyticsController');

// GET /analytics - Return aggregated footfall data per hour/day
router.get('/', getAnalytics);

// GET /analytics/realtime - Get real-time data for the past hour
router.get('/realtime', getRealTimeAnalytics);

// GET /analytics/summary - Get summary statistics
router.get('/summary', getAnalyticsSummary);

module.exports = router; 