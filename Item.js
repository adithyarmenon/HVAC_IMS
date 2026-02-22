const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  // Identification
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  
  // Classification
  category: {
    type: String,
    enum: ['raw_material', 'finished_good', 'consumable', 'packaging', 'tool'],
    required: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  
  // Specifications
  description: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    required: [true, 'Unit of measurement is required'],
    enum: ['pcs', 'kg', 'g', 'liters', 'ml', 'rolls', 'meters', 'boxes', 'packets']
  },
  
  // For HVAC Specific Items
  filterType: {
    type: String,
    enum: ['panel', 'bag', 'pocket', 'vbank', 'cartridge', 'hepa', null],
    default: null
  },
  filterGrade: {
    type: String,
    enum: ['MERV 8', 'MERV 11', 'MERV 13', 'MERV 15', 'MERV 16', 'HEPA', null],
    default: null
  },
  size: {
    type: String,
    trim: true
  },
  mediaType: {
    type: String,
    trim: true
  },
  
  // Stock Management
  currentStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  minStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  maxStock: {
    type: Number,
    required: true,
    default: 1000,
    min: 0
  },
  reorderPoint: {
    type: Number,
    default: function() {
      return this.minStock * 1.5;
    }
  },
  
  // Location
  defaultLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  
  // Supplier Information
  supplier: {
    name: String,
    contact: String,
    leadTime: Number // In days
  },
  
  // Pricing
  costPrice: {
    type: Number,
    min: 0
  },
  sellingPrice: {
    type: Number,
    min: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
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

// Virtual for stock status
itemSchema.virtual('stockStatus').get(function() {
  if (this.currentStock <= this.minStock) {
    return 'critical';
  } else if (this.currentStock <= this.reorderPoint) {
    return 'low';
  } else if (this.currentStock >= this.maxStock) {
    return 'overstock';
  } else {
    return 'normal';
  }
});

// Virtual for stock percentage
itemSchema.virtual('stockPercentage').get(function() {
  return (this.currentStock / this.maxStock) * 100;
});

// Indexes for faster queries
itemSchema.index({ sku: 1 });
itemSchema.index({ name: 'text', description: 'text' });
itemSchema.index({ category: 1, status: 1 });
itemSchema.index({ currentStock: 1 });
itemSchema.index({ defaultLocation: 1 });

// Pre-save middleware to calculate reorder point
itemSchema.pre('save', function(next) {
  if (this.isModified('minStock')) {
    this.reorderPoint = this.minStock * 1.5;
  }
  next();
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;