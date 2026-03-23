const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    timestamp: { type: Date, default: Date.now },
    source: { type: String, required: true },
    sourceIp: { type: String },
    destinationIp: { type: String },
    severity: { type: String, enum: ['CRITIQUE', 'HAUTE', 'MOYENNE', 'FAIBLE', 'INFO'] },
    status: { type: String, enum: ['NOUVEAU', 'EN COURS', 'RÉSOLU', 'FAUX POSITIF'], default: 'NOUVEAU' },
    description: { type: String },
    affectedSystem: { type: String },
    rawLog: { type: String },
    mlData: {
        predictedClass: { type: String },
        confidenceScore: { type: Number },
        riskScore: { type: Number },
        riskLevel: { type: String },
        isAutomated: { type: Boolean, default: false }
    }
});

module.exports = mongoose.model('Alert', AlertSchema);
