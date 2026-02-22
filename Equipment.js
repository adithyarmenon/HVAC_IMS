const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['AC', 'Heater', 'Ventilation', 'Chiller', 'Other']
    },
    model: String,
    serialNumber: String,
    installationDate: Date,
    lastMaintenance: Date,
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    status: {
        type: String,
        enum: ['Active', 'Maintenance', 'Inactive'],
        default: 'Active'
    }
});

module.exports = mongoose.model('Equipment', equipmentSchema);
