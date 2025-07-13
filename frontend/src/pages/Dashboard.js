import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import RealTimeChart from '../components/RealTimeChart';
import DeviceStatusCards from '../components/DeviceStatusCards';
import SummaryCards from '../components/SummaryCards';
import SensorMap from '../components/SensorMap';
import { analyticsAPI, devicesAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';

const Dashboard = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket } = useSocket();

  // Fetch initial data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [summaryResponse, devicesResponse] = await Promise.all([
          analyticsAPI.getAnalyticsSummary(),
          devicesAPI.getDevices()
        ]);

        setSummaryData(summaryResponse.data);
        setDevices(devicesResponse.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleSensorDataUpdate = (data) => {
      console.log('📊 Real-time update received:', data);
      // Refresh data when new sensor data arrives
      fetchDashboardData();
    };

    socket.on('sensorDataUpdate', handleSensorDataUpdate);

    return () => {
      socket.off('sensorDataUpdate', handleSensorDataUpdate);
    };
  }, [socket]);

  const fetchDashboardData = async () => {
    try {
      const [summaryResponse, devicesResponse] = await Promise.all([
        analyticsAPI.getAnalyticsSummary(),
        devicesAPI.getDevices()
      ]);

      setSummaryData(summaryResponse.data);
      setDevices(devicesResponse.data.data);
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-danger-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time footfall monitoring overview</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
          <span>Live updates enabled</span>
        </div>
      </div>

      {/* Summary Cards */}
      {summaryData && <SummaryCards data={summaryData} />}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Chart */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Real-time Footfall</h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Live</span>
              </div>
            </div>
            <RealTimeChart />
          </div>
        </div>

        {/* Device Status */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Device Status</h2>
              <span className="text-sm text-gray-500">{devices.length} devices</span>
            </div>
            <DeviceStatusCards devices={devices} />
          </div>
        </div>
      </div>

      {/* Sensor Map */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Sensor Locations</h2>
          <span className="text-sm text-gray-500">Interactive map view</span>
        </div>
        <SensorMap devices={devices} />
      </div>
    </div>
  );
};

export default Dashboard; 