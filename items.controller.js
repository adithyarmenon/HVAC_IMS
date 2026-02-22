const Item = require('../models/Item');
const Warehouse = require('../models/Warehouse');

// Get all items with pagination and filters
exports.getAllItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    
    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by location
    if (req.query.location) {
      query.defaultLocation = req.query.location;
    }
    
    // Filter by stock status
    if (req.query.stockStatus) {
      const stockConditions = {
        'critical': { $expr: { $lte: ['$currentStock', '$minStock'] } },
        'low': { $expr: { 
          $and: [
            { $gt: ['$currentStock', '$minStock'] },
            { $lte: ['$currentStock', '$reorderPoint'] }
          ]
        }},
        'normal': { $expr: { 
          $and: [
            { $gt: ['$currentStock', '$reorderPoint'] },
            { $lt: ['$currentStock', '$maxStock'] }
          ]
        }},
        'overstock': { $expr: { $gte: ['$currentStock', '$maxStock'] } }
      };
      
      if (stockConditions[req.query.stockStatus]) {
        Object.assign(query, stockConditions[req.query.stockStatus]);
      }
    }
    
    // Search
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { sku: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Execute query with pagination
    const items = await Item.find(query)
      .populate('defaultLocation', 'code name')
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });
    
    // Get total count for pagination
    const total = await Item.countDocuments(query);
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.json({
      success: true,
      data: {
        items,
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
    console.error('Get all items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving items'
    });
  }
};

// Get single item by ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('defaultLocation', 'code name area capacity')
      .populate('createdBy', 'firstName lastName email role');
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        item
      }
    });
  } catch (error) {
    console.error('Get item by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving item'
    });
  }
};

// Get item by SKU
exports.getItemBySku = async (req, res) => {
  try {
    const item = await Item.findOne({ sku: req.params.sku })
      .populate('defaultLocation', 'code name area capacity')
      .populate('createdBy', 'firstName lastName email role');
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        item
      }
    });
  } catch (error) {
    console.error('Get item by SKU error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving item'
    });
  }
};

// Create new item
exports.createItem = async (req, res) => {
  try {
    // Check if SKU already exists
    const existingItem = await Item.findOne({ sku: req.body.sku });
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Item with this SKU already exists'
      });
    }
    
    // Check if default location exists
    const location = await Warehouse.findById(req.body.defaultLocation);
    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Default location not found'
      });
    }
    
    // Create item
    const itemData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const item = new Item(itemData);
    await item.save();
    
    // Populate references
    await item.populate('defaultLocation', 'code name');
    await item.populate('createdBy', 'firstName lastName');
    
    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: {
        item
      }
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update item
exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    // Check if SKU is being changed and if it's already taken
    if (req.body.sku && req.body.sku !== item.sku) {
      const existingItem = await Item.findOne({ sku: req.body.sku });
      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: 'Item with this SKU already exists'
        });
      }
    }
    
    // Check if default location exists (if being changed)
    if (req.body.defaultLocation && req.body.defaultLocation !== item.defaultLocation.toString()) {
      const location = await Warehouse.findById(req.body.defaultLocation);
      if (!location) {
        return res.status(400).json({
          success: false,
          message: 'Default location not found'
        });
      }
    }
    
    // Update item
    Object.keys(req.body).forEach(key => {
      if (key !== 'createdBy') { // Don't allow changing createdBy
        item[key] = req.body[key];
      }
    });
    
    await item.save();
    
    // Populate references
    await item.populate('defaultLocation', 'code name');
    await item.populate('createdBy', 'firstName lastName');
    
    res.json({
      success: true,
      message: 'Item updated successfully',
      data: {
        item
      }
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete item (soft delete by changing status)
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    // Soft delete by changing status
    item.status = 'inactive';
    await item.save();
    
    res.json({
      success: true,
      message: 'Item marked as inactive'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting item'
    });
  }
};

// Get low stock items
exports.getLowStockItems = async (req, res) => {
  try {
    const items = await Item.find({
      $expr: { $lte: ['$currentStock', '$reorderPoint'] },
      status: 'active'
    })
    .populate('defaultLocation', 'code name')
    .sort({ currentStock: 1 });
    
    // Categorize by severity
    const criticalItems = items.filter(item => item.currentStock <= item.minStock);
    const warningItems = items.filter(item => 
      item.currentStock > item.minStock && item.currentStock <= item.reorderPoint
    );
    
    res.json({
      success: true,
      data: {
        items,
        summary: {
          total: items.length,
          critical: criticalItems.length,
          warning: warningItems.length
        },
        criticalItems,
        warningItems
      }
    });
  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving low stock items'
    });
  }
};

// Update stock (for manual adjustments)
exports.updateStock = async (req, res) => {
  try {
    const { quantity, reason, notes } = req.body;
    
    if (!quantity || typeof quantity !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }
    
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    // Calculate new stock
    const newStock = item.currentStock + quantity;
    
    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock. Cannot have negative stock.'
      });
    }
    
    // Update stock
    item.currentStock = newStock;
    await item.save();
    
    // In a real application, you would create a transaction record here
    // For now, we'll just update the stock
    
    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        item: {
          id: item._id,
          sku: item.sku,
          name: item.name,
          previousStock: item.currentStock - quantity,
          newStock: item.currentStock,
          change: quantity
        }
      }
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating stock'
    });
  }
};

// Get item statistics
exports.getItemStatistics = async (req, res) => {
  try {
    const totalItems = await Item.countDocuments();
    const activeItems = await Item.countDocuments({ status: 'active' });
    const rawMaterials = await Item.countDocuments({ category: 'raw_material' });
    const finishedGoods = await Item.countDocuments({ category: 'finished_good' });
    
    // Get low stock count
    const lowStockItems = await Item.countDocuments({
      $expr: { $lte: ['$currentStock', '$reorderPoint'] },
      status: 'active'
    });
    
    // Get out of stock items
    const outOfStockItems = await Item.countDocuments({
      currentStock: 0,
      status: 'active'
    });
    
    // Get total inventory value (if we have cost price)
    const itemsWithCost = await Item.find({
      costPrice: { $exists: true, $gt: 0 }
    });
    
    const totalInventoryValue = itemsWithCost.reduce((total, item) => {
      return total + (item.costPrice * item.currentStock);
    }, 0);
    
    res.json({
      success: true,
      data: {
        totalItems,
        activeItems,
        rawMaterials,
        finishedGoods,
        lowStockItems,
        outOfStockItems,
        totalInventoryValue
      }
    });
  } catch (error) {
    console.error('Get item statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving item statistics'
    });
  }
};