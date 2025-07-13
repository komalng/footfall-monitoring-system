import React from 'react';
import { Wifi, WifiOff, Clock, Activity } from 'lucide-react';
import moment from 'moment';

const DeviceStatusCards = ({ devices }) => {
  const getStatusIcon = (device) => {
    if (device.isActive) {
      return <Wifi className="w-4 h-4 text-success-600" />;
    }
    return <WifiOff className="w-4 h-4 text-danger-600" />;
  };

  const getStatusColor = (device) => {
    if (device.isActive) {
      return 'status-active';
    }
    return 'status-inactive';
  };

  const getStatusText = (device) => {
    if (device.isActive) {
      return 'Active';
    }
    return 'Inactive';
  };

  if (!devices || devices.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No devices found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {devices.slice(0, 5).map((device) => (
        <div
          key={device.sensor_id}
          className={`p-4 rounded-lg border ${getStatusColor(device)}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {getStatusIcon(device)}
              <span className="font-medium text-sm">{device.name || device.sensor_id}</span>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              device.isActive 
                ? 'bg-success-100 text-success-800' 
                : 'bg-danger-100 text-danger-800'
            }`}>
              {getStatusText(device)}
            </span>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Last seen:</span>
              <span className="font-medium">{device.timeSinceLastSeen}</span>
            </div>
            
            {device.battery_level !== undefined && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Battery:</span>
                <div className="flex items-center space-x-1">
                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${
                        device.battery_level > 50 ? 'bg-success-500' : 
                        device.battery_level > 20 ? 'bg-warning-500' : 'bg-danger-500'
                      }`}
                      style={{ width: `${device.battery_level}%` }}
                    ></div>
                  </div>
                  <span className="font-medium">{device.battery_level}%</span>
                </div>
              </div>
            )}
            
            {device.firmware_version && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Firmware:</span>
                <span className="font-medium">{device.firmware_version}</span>
              </div>
            )}
          </div>
          
          {device.description && (
            <p className="text-xs text-gray-600 mt-2">{device.description}</p>
          )}
        </div>
      ))}
      
      {devices.length > 5 && (
        <div className="text-center pt-2">
          <p className="text-sm text-gray-500">
            +{devices.length - 5} more devices
          </p>
        </div>
      )}
    </div>
  );
};

export default DeviceStatusCards; 