const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        success: true,
        data: {
            rawMaterials: 2,
            finishedGoods: 0,
            lowStock: 1,
            todayTransactions: 0
        }
    });
});

module.exports = router;