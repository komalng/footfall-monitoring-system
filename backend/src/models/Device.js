const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  sensor_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
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
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  last_seen: {
    type: Date,
    default: Date.now
  },
  battery_level: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  firmware_version: {
    type: String,
    default: '1.0.0'
  },
  installation_date: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Geospatial index for location-based queries
deviceSchema.index({ location: '2dsphere' });

// Index for status queries
deviceSchema.index({ status: 1 });

// Virtual for checking if device is active (last seen within 1 hour)
deviceSchema.virtual('isActive').get(function() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return this.last_seen > oneHourAgo;
});

// Virtual for formatted last seen
deviceSchema.virtual('formattedLastSeen').get(function() {
  return this.last_seen.toISOString();
});

// Ensure virtual fields are serialized
deviceSchema.set('toJSON', { virtuals: true });
deviceSchema.set('toObject', { virtuals: true });

// Pre-save middleware to update status based on last_seen
deviceSchema.pre('save', function(next) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  if (this.last_seen < oneHourAgo && this.status === 'active') {
    this.status = 'inactive';
  }
  next();
});

module.exports = mongoose.model('Device', deviceSchema); 