import React from 'react';
import { Users, TrendingUp, Clock, Activity } from 'lucide-react';

const SummaryCards = ({ data }) => {
  const cards = [
    {
      title: 'Today\'s Total',
      value: data.today.total_count.toLocaleString(),
      change: data.change_percent,
      icon: Users,
      color: 'primary',
      description: 'Total footfall today'
    },
    {
      title: 'Active Sensors',
      value: data.today.sensor_count,
      icon: Activity,
      color: 'success',
      description: 'Sensors reporting data'
    },
    {
      title: 'Avg per Sensor',
      value: data.today.avg_per_sensor.toLocaleString(),
      icon: TrendingUp,
      color: 'warning',
      description: 'Average footfall per sensor'
    },
    {
      title: 'Last Update',
      value: 'Live',
      icon: Clock,
      color: 'info',
      description: 'Real-time data'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      primary: 'bg-primary-50 text-primary-700 border-primary-200',
      success: 'bg-success-50 text-success-700 border-success-200',
      warning: 'bg-warning-50 text-warning-700 border-warning-200',
      info: 'bg-blue-50 text-blue-700 border-blue-200'
    };
    return colors[color] || colors.primary;
  };

  const getIconColor = (color) => {
    const colors = {
      primary: 'text-primary-600',
      success: 'text-success-600',
      warning: 'text-warning-600',
      info: 'text-blue-600'
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                {card.change !== undefined && (
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      card.change >= 0 ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {card.change >= 0 ? '+' : ''}{card.change}%
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs yesterday</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">{card.description}</p>
              </div>
              <div className={`p-3 rounded-lg ${getColorClasses(card.color)}`}>
                <Icon className={`w-6 h-6 ${getIconColor(card.color)}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards; 