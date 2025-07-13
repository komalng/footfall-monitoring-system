const axios = require('axios');
require('dotenv').config();

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const SENSOR_IDS = ['sensor_001', 'sensor_002'];
const INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const LOCATIONS = [
  { name: 'Main Entrance', coordinates: [40.7128, -74.0060] }, // NYC
  { name: 'Side Entrance', coordinates: [40.7589, -73.9851] }  // NYC
];

// Mock device data for initial setup
const deviceData = [
  {
    sensor_id: 'sensor_001',
    name: 'Main Entrance Sensor',
    location: {
      type: 'Point',
      coordinates: LOCATIONS[0].coordinates
    },
    description: 'Primary entrance footfall monitoring'
  },
  {
    sensor_id: 'sensor_002',
    name: 'Side Entrance Sensor',
    location: {
      type: 'Point',
      coordinates: LOCATIONS[1].coordinates
    },
    description: 'Secondary entrance footfall monitoring'
  }
];

// Generate realistic footfall count based on time of day
function generateFootfallCount() {
  const now = new Date();
  const hour = now.getHours();
  
  // Base footfall patterns (more traffic during business hours)
  let baseCount = 0;
  
  if (hour >= 6 && hour <= 9) {
    // Morning rush
    baseCount = Math.floor(Math.random() * 30) + 20;
  } else if (hour >= 10 && hour <= 16) {
    // Business hours
    baseCount = Math.floor(Math.random() * 20) + 10;
  } else if (hour >= 17 && hour <= 20) {
    // Evening rush
    baseCount = Math.floor(Math.random() * 25) + 15;
  } else {
    // Night hours
    baseCount = Math.floor(Math.random() * 10) + 1;
  }
  
  // Add some randomness
  const variation = Math.floor(Math.random() * 10) - 5;
  return Math.max(0, baseCount + variation);
}

// Send sensor data to API
async function sendSensorData(sensorId, count) {
  try {
    const payload = {
      sensor_id: sensorId,
      timestamp: new Date().toISOString(),
      count: count
    };

    const response = await axios.post(`${API_BASE_URL}/sensor-data`, payload);
    console.log(`✅ Sent data for ${sensorId}: ${count} people at ${new Date().toLocaleTimeString()}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error sending data for ${sensorId}:`, error.message);
    return null;
  }
}

// Setup devices in the system
async function setupDevices() {
  console.log('🔧 Setting up devices...');
  
  for (const device of deviceData) {
    try {
      await axios.post(`${API_BASE_URL}/devices`, device);
      console.log(`✅ Device ${device.sensor_id} setup complete`);
    } catch (error) {
      console.log(`⚠️ Device ${device.sensor_id} already exists or setup failed:`, error.message);
    }
  }
}

// Simulate sensor data for all sensors
async function simulateSensorData() {
  console.log('\n🔄 Simulating sensor data...');
  
  for (const sensorId of SENSOR_IDS) {
    const count = generateFootfallCount();
    await sendSensorData(sensorId, count);
  }
  
  console.log('✅ Simulation cycle complete\n');
}

// Main simulation loop
async function startSimulation() {
  console.log('🚀 Starting Footfall Monitoring Simulator');
  console.log(`📡 API Base URL: ${API_BASE_URL}`);
  console.log(`⏰ Interval: ${INTERVAL_MS / 1000 / 60} minutes`);
  console.log(`📊 Sensors: ${SENSOR_IDS.join(', ')}`);
  
  // Setup devices first
  await setupDevices();
  
  // Initial data send
  await simulateSensorData();
  
  // Set up periodic simulation
  setInterval(simulateSensorData, INTERVAL_MS);
  
  console.log('🔄 Simulator running... Press Ctrl+C to stop\n');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Simulator stopped');
  process.exit(0);
});

// Start the simulation
startSimulation().catch(error => {
  console.error('❌ Failed to start simulator:', error);
  process.exit(1);
}); 