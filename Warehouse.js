const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  // Basic Information
  code: {
    type: String,
    required: [true, 'Warehouse code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Warehouse name is required'],
    trim: true
  },
  
  // Location Details
  type: {
    type: String,
    enum: ['warehouse', 'production_area', 'dispatch_area', 'store_room', 'packaging_area'],
    default: 'warehouse'
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  
  // Physical Details
  area: {
    type: String,
    required: [true, 'Area is required']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: 0
  },
  
  // Contact Information
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  contactPerson: {
    name: String,
    phone: String,
    email: String
  },
  
  // Storage Information
  storageType: {
    type: String,
    enum: ['rack', 'floor', 'shelf', 'cold_storage', 'hazardous'],
    default: 'rack'
  },
  temperatureControl: {
    type: Boolean,
    default: false
  },
  humidityControl: {
    type: Boolean,
    default: false
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for current occupancy (will be populated)
warehouseSchema.virtual('currentOccupancy').get(function() {
  return 0; // Will be calculated from items
});

warehouseSchema.virtual('occupancyPercentage').get(function() {
  if (this.capacity === 0) return 0;
  return (this.currentOccupancy / this.capacity) * 100;
});

warehouseSchema.virtual('status').get(function() {
  const percentage = this.occupancyPercentage;
  if (!this.isActive) return 'inactive';
  if (percentage >= 90) return 'full';
  if (percentage >= 70) return 'busy';
  return 'available';
});

// Indexes
warehouseSchema.index({ code: 1 });
warehouseSchema.index({ type: 1, isActive: 1 });
warehouseSchema.index({ 'address.city': 1 });

const Warehouse = mongoose.model('Warehouse', warehouseSchema);

module.exports = Warehouse;