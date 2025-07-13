import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const SensorMap = ({ devices }) => {
  // Default center (NYC)
  const defaultCenter = [40.7128, -74.0060];
  
  // Filter devices with valid coordinates
  const devicesWithLocation = devices.filter(device => 
    device.location && 
    device.location.coordinates && 
    device.location.coordinates.length === 2
  );

  // Calculate map bounds if devices exist
  const getMapBounds = () => {
    if (devicesWithLocation.length === 0) {
      return [defaultCenter];
    }
    
    const bounds = L.latLngBounds(
      devicesWithLocation.map(device => device.location.coordinates)
    );
    return bounds;
  };

  const getMarkerIcon = (device) => {
    const color = device.isActive ? '#10b981' : '#ef4444';
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background-color: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  if (!devices || devices.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="text-gray-600">No devices with location data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: '400px', width: '100%' }}
        bounds={getMapBounds()}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {devicesWithLocation.map((device) => (
          <Marker
            key={device.sensor_id}
            position={device.location.coordinates}
            icon={getMarkerIcon(device)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {device.name || device.sensor_id}
                </h3>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Status:</span>{' '}
                    <span className={`${
                      device.isActive ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {device.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Last seen:</span>{' '}
                    {device.timeSinceLastSeen}
                  </p>
                  {device.battery_level !== undefined && (
                    <p className="text-gray-600">
                      <span className="font-medium">Battery:</span>{' '}
                      {device.battery_level}%
                    </p>
                  )}
                  {device.description && (
                    <p className="text-gray-600 text-xs mt-2">
                      {device.description}
                    </p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md border">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-danger-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Inactive</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorMap; 