const Warehouse = require('../models/Warehouse');
const Item = require('../models/Item');

// Get all warehouses
exports.getAllWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find()
      .populate('manager', 'firstName lastName email')
      .sort({ name: 1 });
    
    // Calculate current occupancy for each warehouse
    const warehousesWithOccupancy = await Promise.all(
      warehouses.map(async (warehouse) => {
        const itemsInWarehouse = await Item.find({
          defaultLocation: warehouse._id,
          status: 'active'
        });
        
        const itemCount = itemsInWarehouse.length;
        const stockValue = itemsInWarehouse.reduce((total, item) => {
          return total + (item.currentStock || 0);
        }, 0);
        
        const warehouseObj = warehouse.toObject();
        warehouseObj.currentOccupancy = itemCount;
        warehouseObj.stockValue = stockValue;
        warehouseObj.occupancyPercentage = warehouse.capacity > 0 
          ? (itemCount / warehouse.capacity) * 100 
          : 0;
        
        return warehouseObj;
      })
    );
    
    res.json({
      success: true,
      data: {
        warehouses: warehousesWithOccupancy
      }
    });
  } catch (error) {
    console.error('Get all warehouses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving warehouses'
    });
  }
};

// Get single warehouse by ID
exports.getWarehouseById = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id)
      .populate('manager', 'firstName lastName email phone');
    
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }
    
    // Get items in this warehouse
    const items = await Item.find({
      defaultLocation: warehouse._id,
      status: 'active'
    }).select('sku name category currentStock unit minStock maxStock');
    
    // Calculate statistics
    const itemCount = items.length;
    const totalStockValue = items.reduce((total, item) => {
      return total + (item.currentStock || 0);
    }, 0);
    
    // Categorize items
    const rawMaterials = items.filter(item => item.category === 'raw_material');
    const finishedGoods = items.filter(item => item.category === 'finished_good');
    
    // Get low stock items in this warehouse
    const lowStockItems = items.filter(item => 
      item.currentStock <= item.reorderPoint
    );
    
    const warehouseData = warehouse.toObject();
    warehouseData.items = items;
    warehouseData.statistics = {
      totalItems: itemCount,
      totalStockValue,
      rawMaterials: rawMaterials.length,
      finishedGoods: finishedGoods.length,
      lowStockItems: lowStockItems.length,
      occupancyPercentage: warehouse.capacity > 0 
        ? (itemCount / warehouse.capacity) * 100 
        : 0
    };
    
    res.json({
      success: true,
      data: {
        warehouse: warehouseData
      }
    });
  } catch (error) {
    console.error('Get warehouse by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving warehouse'
    });
  }
};

// Create new warehouse
exports.createWarehouse = async (req, res) => {
  try {
    // Check if warehouse code already exists
    const existingWarehouse = await Warehouse.findOne({ code: req.body.code });
    if (existingWarehouse) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse with this code already exists'
      });
    }
    
    // Create warehouse
    const warehouseData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const warehouse = new Warehouse(warehouseData);
    await warehouse.save();
    
    // Populate references
    await warehouse.populate('manager', 'firstName lastName');
    await warehouse.populate('createdBy', 'firstName lastName');
    
    res.status(201).json({
      success: true,
      message: 'Warehouse created successfully',
      data: {
        warehouse
      }
    });
  } catch (error) {
    console.error('Create warehouse error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating warehouse',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update warehouse
exports.updateWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }
    
    // Check if code is being changed and if it's already taken
    if (req.body.code && req.body.code !== warehouse.code) {
      const existingWarehouse = await Warehouse.findOne({ code: req.body.code });
      if (existingWarehouse) {
        return res.status(400).json({
          success: false,
          message: 'Warehouse with this code already exists'
        });
      }
    }
    
    // Update warehouse
    Object.keys(req.body).forEach(key => {
      warehouse[key] = req.body[key];
    });
    
    await warehouse.save();
    
    // Populate references
    await warehouse.populate('manager', 'firstName lastName');
    
    res.json({
      success: true,
      message: 'Warehouse updated successfully',
      data: {
        warehouse
      }
    });
  } catch (error) {
    console.error('Update warehouse error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating warehouse'
    });
  }
};

// Delete warehouse (soft delete)
exports.deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }
    
    // Check if warehouse has items
    const itemCount = await Item.countDocuments({
      defaultLocation: warehouse._id,
      status: 'active'
    });
    
    if (itemCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete warehouse. It contains ${itemCount} active items. Move items to another warehouse first.`
      });
    }
    
    // Soft delete
    warehouse.isActive = false;
    await warehouse.save();
    
    res.json({
      success: true,
      message: 'Warehouse marked as inactive'
    });
  } catch (error) {
    console.error('Delete warehouse error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting warehouse'
    });
  }
};

// Get warehouse statistics
exports.getWarehouseStatistics = async (req, res) => {
  try {
    const warehouses = await Warehouse.find({ isActive: true });
    
    const statistics = await Promise.all(
      warehouses.map(async (warehouse) => {
        const items = await Item.find({
          defaultLocation: warehouse._id,
          status: 'active'
        });
        
        const itemCount = items.length;
        const totalStockValue = items.reduce((total, item) => {
          return total + (item.currentStock || 0);
        }, 0);
        
        return {
          warehouse: {
            id: warehouse._id,
            code: warehouse.code,
            name: warehouse.name
          },
          itemCount,
          totalStockValue,
          capacity: warehouse.capacity,
          occupancyPercentage: warehouse.capacity > 0 
            ? (itemCount / warehouse.capacity) * 100 
            : 0
        };
      })
    );
    
    // Calculate overall statistics
    const totalWarehouses = warehouses.length;
    const totalItems = statistics.reduce((total, stat) => total + stat.itemCount, 0);
    const totalCapacity = statistics.reduce((total, stat) => total + stat.capacity, 0);
    const overallOccupancy = totalCapacity > 0 
      ? (totalItems / totalCapacity) * 100 
      : 0;
    
    res.json({
      success: true,
      data: {
        statistics,
        summary: {
          totalWarehouses,
          totalItems,
          totalCapacity,
          overallOccupancy
        }
      }
    });
  } catch (error) {
    console.error('Get warehouse statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving warehouse statistics'
    });
  }
};

// Get available warehouses (for dropdowns)
exports.getAvailableWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find({
      isActive: true
    }).select('code name type area capacity')
     .sort({ name: 1 });
    
    res.json({
      success: true,
      data: {
        warehouses
      }
    });
  } catch (error) {
    console.error('Get available warehouses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving warehouses'
    });
  }
};