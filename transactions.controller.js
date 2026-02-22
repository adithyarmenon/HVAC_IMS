const Transaction = require('../models/Transaction');
const Item = require('../models/Item');
const Warehouse = require('../models/Warehouse');

// Get all transactions with filters
exports.getAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    
    // Filter by type
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by item
    if (req.query.item) {
      query.item = req.query.item;
    }
    
    // Filter by location
    if (req.query.location) {
      query.$or = [
        { fromLocation: req.query.location },
        { toLocation: req.query.location }
      ];
    }
    
    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.transactionDate = {};
      
      if (req.query.startDate) {
        query.transactionDate.$gte = new Date(req.query.startDate);
      }
      
      if (req.query.endDate) {
        query.transactionDate.$lte = new Date(req.query.endDate);
      }
    }
    
    // Search by reference number
    if (req.query.reference) {
      query.referenceNumber = { $regex: req.query.reference, $options: 'i' };
    }
    
    // Execute query with pagination
    const transactions = await Transaction.find(query)
      .populate('item', 'sku name category unit')
      .populate('fromLocation', 'code name')
      .populate('toLocation', 'code name')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .skip(skip)
      .limit(limit)
      .sort({ transactionDate: -1 });
    
    // Get total count for pagination
    const total = await Transaction.countDocuments(query);
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      }
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving transactions'
    });
  }
};

// Get single transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('item', 'sku name category unit currentStock')
      .populate('fromLocation', 'code name type address')
      .populate('toLocation', 'code name type address')
      .populate('createdBy', 'firstName lastName email role')
      .populate('approvedBy', 'firstName lastName email role');
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        transaction
      }
    });
  } catch (error) {
    console.error('Get transaction by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving transaction'
    });
  }
};

// Create new transaction
exports.createTransaction = async (req, res) => {
  try {
    const { type, item, quantity, unit, fromLocation, toLocation, referenceNumber, referenceType, unitPrice, notes } = req.body;
    
    // Validate item exists
    const itemDoc = await Item.findById(item);
    if (!itemDoc) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    // Validate locations if provided
    if (fromLocation) {
      const fromLocationDoc = await Warehouse.findById(fromLocation);
      if (!fromLocationDoc) {
        return res.status(404).json({
          success: false,
          message: 'From location not found'
        });
      }
    }
    
    if (toLocation) {
      const toLocationDoc = await Warehouse.findById(toLocation);
      if (!toLocationDoc) {
        return res.status(404).json({
          success: false,
          message: 'To location not found'
        });
      }
    }
    
    // Validate stock for outward transactions
    if (type === 'outward') {
      if (itemDoc.currentStock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Available: ${itemDoc.currentStock} ${itemDoc.unit}, Requested: ${quantity} ${unit}`
        });
      }
      
      if (!fromLocation) {
        return res.status(400).json({
          success: false,
          message: 'From location is required for outward transactions'
        });
      }
    }
    
    // Validate for inward transactions
    if (type === 'inward' && !toLocation) {
      return res.status(400).json({
        success: false,
        message: 'To location is required for inward transactions'
      });
    }
    
    // Validate for transfer transactions
    if (type === 'transfer') {
      if (!fromLocation || !toLocation) {
        return res.status(400).json({
          success: false,
          message: 'Both from and to locations are required for transfer transactions'
        });
      }
      
      if (fromLocation === toLocation) {
        return res.status(400).json({
          success: false,
          message: 'From and to locations cannot be the same for transfer transactions'
        });
      }
    }
    
    // Create transaction
    const transactionData = {
      type,
      item,
      quantity,
      unit,
      fromLocation,
      toLocation,
      referenceNumber,
      referenceType,
      unitPrice,
      notes,
      createdBy: req.user._id,
      transactionDate: new Date(),
      status: 'pending' // Transactions need approval
    };
    
    const transaction = new Transaction(transactionData);
    await transaction.save();
    
    // Populate references
    await transaction.populate('item', 'sku name');
    await transaction.populate('fromLocation', 'code name');
    await transaction.populate('toLocation', 'code name');
    await transaction.populate('createdBy', 'firstName lastName');
    
    res.status(201).json({
      success: true,
      message: 'Transaction created successfully. Waiting for approval.',
      data: {
        transaction
      }
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update transaction (for approval/rejection)
exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // Only allow updating status and notes
    const allowedUpdates = ['status', 'notes'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    // If status is being changed to completed, add approvedBy
    if (updates.status === 'completed' && transaction.status !== 'completed') {
      updates.approvedBy = req.user._id;
    }
    
    // If status is being changed from pending, check permissions
    if (transaction.status === 'pending' && updates.status && updates.status !== 'pending') {
      // Only managers and admins can approve/reject transactions
      if (!['admin', 'inventory_manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to approve/reject transactions'
        });
      }
    }
    
    // Update transaction
    Object.keys(updates).forEach(key => {
      transaction[key] = updates[key];
    });
    
    await transaction.save();
    
    // If transaction is completed, update item stock
    if (transaction.status === 'completed') {
      const item = await Item.findById(transaction.item);
      
      if (item) {
        let stockChange = 0;
        
        switch (transaction.type) {
          case 'inward':
            stockChange = transaction.quantity;
            break;
          case 'outward':
            stockChange = -transaction.quantity;
            break;
          case 'adjustment':
            // For adjustment, we might need different logic
            // For now, we'll use quantity as the adjustment amount
            stockChange = transaction.quantity - item.currentStock;
            break;
        }
        
        if (stockChange !== 0) {
          item.currentStock += stockChange;
          await item.save();
        }
        
        // For transfers, we might need to update location-specific stock
        // This would require a separate collection for location stock
      }
    }
    
    // Populate references
    await transaction.populate('item', 'sku name');
    await transaction.populate('fromLocation', 'code name');
    await transaction.populate('toLocation', 'code name');
    await transaction.populate('createdBy', 'firstName lastName');
    await transaction.populate('approvedBy', 'firstName lastName');
    
    res.json({
      success: true,
      message: `Transaction ${transaction.status}`,
      data: {
        transaction
      }
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating transaction'
    });
  }
};

// Delete transaction (only if pending)
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // Only allow deletion of pending transactions
    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending transactions can be deleted'
      });
    }
    
    // Check if user created the transaction or is admin/manager
    if (transaction.createdBy.toString() !== req.user._id.toString() && 
        !['admin', 'inventory_manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own pending transactions'
      });
    }
    
    await transaction.deleteOne();
    
    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting transaction'
    });
  }
};

// Get transaction statistics
exports.getTransactionStatistics = async (req, res) => {
  try {
    // Get date range (default: last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    // Count by type
    const countsByType = await Transaction.aggregate([
      {
        $match: {
          transactionDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: '$totalValue' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Count by status
    const countsByStatus = await Transaction.aggregate([
      {
        $match: {
          transactionDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Daily transaction count (last 7 days)
    const dailyCounts = await Transaction.aggregate([
      {
        $match: {
          transactionDate: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
            $lte: new Date()
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$transactionDate' }
          },
          count: { $sum: 1 },
          inward: {
            $sum: { $cond: [{ $eq: ['$type', 'inward'] }, 1, 0] }
          },
          outward: {
            $sum: { $cond: [{ $eq: ['$type', 'outward'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);
    
    // Top items by transaction volume
    const topItems = await Transaction.aggregate([
      {
        $match: {
          transactionDate: { $gte: startDate, $lte: endDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$item',
          transactionCount: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'items',
          localField: '_id',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },
      {
        $unwind: '$itemDetails'
      },
      {
        $project: {
          itemName: '$itemDetails.name',
          itemSku: '$itemDetails.sku',
          transactionCount: 1,
          totalQuantity: 1
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        dateRange: {
          startDate,
          endDate
        },
        countsByType,
        countsByStatus,
        dailyCounts,
        topItems,
        summary: {
          totalTransactions: countsByType.reduce((sum, type) => sum + type.count, 0),
          pendingTransactions: countsByStatus.find(s => s._id === 'pending')?.count || 0
        }
      }
    });
  } catch (error) {
    console.error('Get transaction statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving transaction statistics'
    });
  }
};

// Get pending transactions (for approval)
exports.getPendingTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ status: 'pending' })
      .populate('item', 'sku name category unit')
      .populate('fromLocation', 'code name')
      .populate('toLocation', 'code name')
      .populate('createdBy', 'firstName lastName')
      .sort({ transactionDate: 1 });
    
    res.json({
      success: true,
      data: {
        transactions,
        count: transactions.length
      }
    });
  } catch (error) {
    console.error('Get pending transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving pending transactions'
    });
  }
};