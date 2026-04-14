const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['Hebdomadaire', 'Conformité', 'Exécutif', 'Technique', 'Investigation'], default: 'Technique' },
    date: { type: Date, default: Date.now },
    author: { type: String, default: 'Système' },
    size: { type: String, default: '2.4 MB' },
    status: { type: String, enum: ['ready', 'generating'], default: 'ready' }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
