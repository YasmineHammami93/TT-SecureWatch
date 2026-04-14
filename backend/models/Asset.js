const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['Serveur', 'Réseau', 'Poste', 'Stockage'], default: 'Serveur' },
    ip: { type: String, required: true },
    os: { type: String },
    status: { type: String, enum: ['online', 'offline', 'warning'], default: 'online' },
    lastSeen: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Asset', AssetSchema);
