const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  sensor_id: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  count: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
sensorDataSchema.index({ sensor_id: 1, timestamp: -1 });

// Geospatial index for location-based queries
sensorDataSchema.index({ location: '2dsphere' });

// Virtual for formatted timestamp
sensorDataSchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toISOString();
});

// Ensure virtual fields are serialized
sensorDataSchema.set('toJSON', { virtuals: true });
sensorDataSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SensorData', sensorDataSchema); 