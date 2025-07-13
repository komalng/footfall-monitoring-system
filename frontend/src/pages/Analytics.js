import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Download } from 'lucide-react';
import { analyticsAPI } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('hour');
  const [selectedSensor, setSelectedSensor] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [period, selectedSensor]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = { period };
      if (selectedSensor !== 'all') {
        params.sensor_id = selectedSensor;
      }
      
      const response = await analyticsAPI.getAnalytics(params);
      setAnalyticsData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    if (!analyticsData || !analyticsData.data) return null;

    const sensors = [...new Set(analyticsData.data.map(item => item.sensor_id))];
    const periods = [...new Set(analyticsData.data.map(item => item.period))];

    const datasets = sensors.map((sensorId, index) => {
      const colors = [
        { border: '#3b82f6', background: 'rgba(59, 130, 246, 0.8)' },
        { border: '#10b981', background: 'rgba(16, 185, 129, 0.8)' },
        { border: '#f59e0b', background: 'rgba(245, 158, 11, 0.8)' },
        { border: '#ef4444', background: 'rgba(239, 68, 68, 0.8)' }
      ];

      const data = periods.map(period => {
        const item = analyticsData.data.find(d => d.sensor_id === sensorId && d.period === period);
        return item ? item.total_count : 0;
      });

      return {
        label: sensorId,
        data,
        backgroundColor: colors[index % colors.length].background,
        borderColor: colors[index % colors.length].border,
        borderWidth: 1,
      };
    });

    return {
      labels: periods.map(p => {
        if (period === 'hour') {
          return new Date(p).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });
        }
        return new Date(p).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      }),
      datasets
    };
  };

  const chartData = prepareChartData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: period === 'hour' ? 'Time' : 'Date'
        },
        grid: {
          display: false
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Footfall Count'
        },
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Analytics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchAnalytics} className="btn-primary">
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
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Detailed footfall analysis and insights</p>
        </div>
        <button className="btn-secondary flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Export Data</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="hour">Hourly</option>
              <option value="day">Daily</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-gray-400" />
            <select
              value={selectedSensor}
              onChange={(e) => setSelectedSensor(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Sensors</option>
              {analyticsData?.data && [...new Set(analyticsData.data.map(item => item.sensor_id))].map(sensorId => (
                <option key={sensorId} value={sensorId}>{sensorId}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Footfall Analytics - {period === 'hour' ? 'Hourly' : 'Daily'} View
          </h2>
          <span className="text-sm text-gray-500">
            {analyticsData?.count || 0} data points
          </span>
        </div>
        
        {chartData ? (
          <div className="chart-container">
            <Bar data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-80">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No analytics data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      {analyticsData?.data && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Raw Data</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sensor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.data.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.sensor_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.period}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.total_count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.data_points}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.avg_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics; 