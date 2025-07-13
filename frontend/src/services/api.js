import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Sensor Data API
export const sensorAPI = {
  // POST /sensor-data
  postSensorData: (data) => api.post('/sensor-data', data),
  
  // GET /sensor-data
  getSensorData: (params) => api.get('/sensor-data', { params }),
  
  // GET /sensor-data/:sensor_id
  getSensorDataById: (sensorId, params) => api.get(`/sensor-data/${sensorId}`, { params }),
};

// Analytics API
export const analyticsAPI = {
  // GET /analytics
  getAnalytics: (params) => api.get('/analytics', { params }),
  
  // GET /analytics/realtime
  getRealTimeAnalytics: (params) => api.get('/analytics/realtime', { params }),
  
  // GET /analytics/summary
  getAnalyticsSummary: (params) => api.get('/analytics/summary', { params }),
};

// Devices API
export const devicesAPI = {
  // GET /devices
  getDevices: (params) => api.get('/devices', { params }),
  
  // GET /devices/:sensor_id
  getDeviceById: (sensorId) => api.get(`/devices/${sensorId}`),
  
  // POST /devices
  createOrUpdateDevice: (data) => api.post('/devices', data),
  
  // PUT /devices/:sensor_id/status
  updateDeviceStatus: (sensorId, status) => api.put(`/devices/${sensorId}/status`, { status }),
  
  // GET /devices/status/summary
  getDeviceStatusSummary: () => api.get('/devices/status/summary'),
};

// Health check
export const healthAPI = {
  getHealth: () => api.get('/health'),
};

export default api; 