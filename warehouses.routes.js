const express = require('express');
const router = express.Router();
const warehousesController = require('../controllers/warehouses.controller');

router.get('/', warehousesController.getAllWarehouses);
router.get('/:id', warehousesController.getWarehouseById);
router.post('/', warehousesController.createWarehouse);
router.put('/:id', warehousesController.updateWarehouse);
router.delete('/:id', warehousesController.deleteWarehouse);

module.exports = router;
