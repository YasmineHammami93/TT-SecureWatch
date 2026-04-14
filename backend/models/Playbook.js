const mongoose = require('mongoose');

const PlaybookSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    incidentType: { type: String, default: 'General' },
    trigger: { type: String, default: 'Toutes Alertes' },
    category: { type: String, default: 'Security Output' },
    automated: { type: Boolean, default: false },
    actions: [{ type: String }],
    parameters: {
        notifications: { type: Boolean, default: true },
        ipBlocking: { type: Boolean, default: false }
    },
    steps: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Playbook', PlaybookSchema);
