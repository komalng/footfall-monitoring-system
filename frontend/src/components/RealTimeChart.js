import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { analyticsAPI } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RealTimeChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  const [loading, setLoading] = useState(true);

  const fetchRealTimeData = async () => {
    try {
      const response = await analyticsAPI.getRealTimeAnalytics();
      const data = response.data.data;
      
      // Transform data for Chart.js
      const datasets = Object.keys(data).map((sensorId, index) => {
        const colors = [
          { border: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' },
          { border: '#10b981', background: 'rgba(16, 185, 129, 0.1)' },
          { border: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' },
          { border: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }
        ];
        
        return {
          label: sensorId,
          data: data[sensorId].data,
          borderColor: colors[index % colors.length].border,
          backgroundColor: colors[index % colors.length].background,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        };
      });

      const labels = Object.values(data)[0]?.labels || [];
      
      setChartData({
        labels: labels.map(label => {
          const date = new Date(label);
          return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });
        }),
        datasets
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealTimeData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchRealTimeData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const options = {
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
          text: 'Time'
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
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading real-time data...</p>
        </div>
      </div>
    );
  }

  if (chartData.datasets.length === 0) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <p className="text-gray-600">No real-time data available</p>
          <button
            onClick={fetchRealTimeData}
            className="btn-primary mt-2"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default RealTimeChart; 