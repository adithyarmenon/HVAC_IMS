const mongoose = require('mongoose');

const rawMaterialSchema = new mongoose.Schema({
  // Identification
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  
  name: {
    type: String,
    required: [true, 'Material name is required'],
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  category: {
    type: String,
    enum: ['filter_media', 'frames', 'carbon', 'adhesive', 'packaging', 'other'],
    default: 'other'
  },
  
  // Stock Information
  currentStock: {
    type: Number,
    required: [true, 'Current stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['rolls', 'kg', 'liters', 'pcs', 'boxes', 'meters'],
    default: 'pcs'
  },
  
  minStock: {
    type: Number,
    required: [true, 'Minimum stock level is required'],
    min: [0, 'Minimum stock cannot be negative'],
    default: 0
  },
  
  maxStock: {
    type: Number,
    required: [true, 'Maximum stock level is required'],
    min: [0, 'Maximum stock cannot be negative']
  },
  
  // Location
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: [true, 'Location is required']
  },
  
  warehouse: {
    type: String,
    trim: true
  },
  
  // Supplier Information (optional)
  supplier: {
    name: String,
    contact: String,
    leadTime: Number, // in days
  },
  
  // Status
  status: {
    type: String,
    enum: ['critical', 'low', 'good', 'overstock'],
    default: 'good',
    index: true
  },
  
  // Pricing
  costPrice: {
    type: Number,
    min: [0, 'Cost price cannot be negative']
  },
  
  // Reorder Information
  reorderPoint: {
    type: Number,
    default: function() {
      return this.minStock * 1.2; // 20% above min stock
    }
  },
  
  // Auditing
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Virtual for stock percentage
rawMaterialSchema.virtual('stockPercentage').get(function() {
  if (this.maxStock === 0) return 0;
  return Math.round((this.currentStock / this.maxStock) * 100);
});

// Virtual for stock status
rawMaterialSchema.virtual('stockStatus').get(function() {
  const percentage = this.stockPercentage;
  if (percentage <= 20) return 'critical';
  if (percentage <= 40) return 'low';
  if (percentage >= 90) return 'overstock';
  return 'good';
});

// Update status before saving
rawMaterialSchema.pre('save', function(next) {
  // Calculate and update status based on stock levels
  if (this.currentStock <= this.minStock) {
    this.status = 'critical';
  } else if (this.currentStock <= this.reorderPoint) {
    this.status = 'low';
  } else if (this.currentStock >= this.maxStock * 0.9) {
    this.status = 'overstock';
  } else {
    this.status = 'good';
  }
  
  this.updatedAt = Date.now();
  next();
});

// Static method to get low stock items
rawMaterialSchema.statics.getLowStock = function() {
  return this.find({
    $or: [
      { status: 'critical' },
      { status: 'low' }
    ]
  }).sort({ currentStock: 1 });
};

// Indexes
rawMaterialSchema.index({ sku: 1 });
rawMaterialSchema.index({ name: 1 });
rawMaterialSchema.index({ status: 1 });
rawMaterialSchema.index({ location: 1 });
rawMaterialSchema.index({ currentStock: 1 });

module.exports = mongoose.model('RawMaterial', rawMaterialSchema);