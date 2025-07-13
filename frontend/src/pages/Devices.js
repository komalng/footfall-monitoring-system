import React, { useState, useEffect } from 'react';
import { Settings, Plus, Search, Filter } from 'lucide-react';
import { devicesAPI } from '../services/api';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await devicesAPI.getDevices();
      setDevices(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching devices:', err);
      setError('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.sensor_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (device) => {
    const statusClasses = {
      active: 'bg-success-100 text-success-800 border-success-200',
      inactive: 'bg-danger-100 text-danger-800 border-danger-200',
      maintenance: 'bg-warning-100 text-warning-800 border-warning-200'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusClasses[device.status]}`}>
        {device.status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading devices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Devices</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchDevices} className="btn-primary">
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
          <h1 className="text-3xl font-bold text-gray-900">Devices</h1>
          <p className="text-gray-600 mt-1">Manage and monitor sensor devices</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Device</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search devices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDevices.map((device) => (
          <div key={device.sensor_id} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{device.name}</h3>
                <p className="text-sm text-gray-500">{device.sensor_id}</p>
              </div>
              {getStatusBadge(device)}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Last seen:</span>
                <span className="font-medium">{device.timeSinceLastSeen}</span>
              </div>

              {device.battery_level !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Battery:</span>
                    <span className="font-medium">{device.battery_level}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        device.battery_level > 50 ? 'bg-success-500' :
                        device.battery_level > 20 ? 'bg-warning-500' : 'bg-danger-500'
                      }`}
                      style={{ width: `${device.battery_level}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {device.firmware_version && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Firmware:</span>
                  <span className="font-medium">{device.firmware_version}</span>
                </div>
              )}

              {device.installation_date && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Installed:</span>
                  <span className="font-medium">
                    {new Date(device.installation_date).toLocaleDateString()}
                  </span>
                </div>
              )}

              {device.description && (
                <p className="text-sm text-gray-600 pt-2 border-t border-gray-200">
                  {device.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View Details
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-700">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDevices.length === 0 && (
        <div className="text-center py-12">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No devices found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'No devices have been added yet'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Devices; 