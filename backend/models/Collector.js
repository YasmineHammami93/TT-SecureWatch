const mongoose = require('mongoose');

const CollectorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    status: { type: String, enum: ['Actif', 'Inactif'], default: 'Actif' },
    lastSync: { type: Date, default: Date.now },
    type: { type: String, default: 'SIEM' }
}, { timestamps: true });

module.exports = mongoose.model('Collector', CollectorSchema);
