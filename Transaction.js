const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // Transaction Identification
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['inward', 'outward', 'transfer', 'adjustment', 'return'],
    required: true
  },
  
  // Item Information
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 0.01
  },
  unit: {
    type: String,
    required: true
  },
  
  // Location Information
  fromLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse'
  },
  toLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse'
  },
  
  // Reference Information
  referenceNumber: {
    type: String,
    trim: true
  },
  referenceType: {
    type: String,
    enum: ['purchase_order', 'sales_order', 'transfer_order', 'production_order', 'return_order', null]
  },
  
  // Pricing
  unitPrice: {
    type: Number,
    min: 0
  },
  totalValue: {
    type: Number,
    min: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  
  // Additional Information
  notes: {
    type: String,
    trim: true
  },
  
  // Tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Timestamps
  transactionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate transaction ID
transactionSchema.pre('save', async function(next) {
  if (!this.transactionId) {
    const prefix = this.type.substring(0, 3).toUpperCase();
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Find the last transaction for this type and month
    const lastTransaction = await this.constructor.findOne({
      transactionId: new RegExp(`^${prefix}-${year}${month}`)
    }).sort({ transactionId: -1 });
    
    let sequence = 1;
    if (lastTransaction) {
      const lastSeq = parseInt(lastTransaction.transactionId.split('-')[2]);
      sequence = lastSeq + 1;
    }
    
    this.transactionId = `${prefix}-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }
  
  // Calculate total value
  if (this.unitPrice && this.quantity) {
    this.totalValue = this.unitPrice * this.quantity;
  }
  
  next();
});

// Indexes for faster queries
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ item: 1 });
transactionSchema.index({ transactionDate: -1 });
transactionSchema.index({ createdBy: 1 });
transactionSchema.index({ referenceNumber: 1 });

// Post-save middleware to update item stock
transactionSchema.post('save', async function(doc) {
  if (doc.status === 'completed') {
    const Item = mongoose.model('Item');
    const item = await Item.findById(doc.item);
    
    if (item) {
      let stockChange = 0;
      
      switch (doc.type) {
        case 'inward':
          stockChange = doc.quantity;
          break;
        case 'outward':
          stockChange = -doc.quantity;
          break;
        case 'transfer':
          // Transfer doesn't change total stock, just location
          // We'll handle location-specific stock in a separate collection if needed
          break;
        case 'adjustment':
          // For adjustment, we need to know the adjustment amount
          // This would require additional field for target stock
          break;
      }
      
      if (stockChange !== 0) {
        item.currentStock += stockChange;
        await item.save();
      }
    }
  }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;