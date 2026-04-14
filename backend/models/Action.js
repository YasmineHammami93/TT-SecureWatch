const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
    alertId: {
        type: String,
        required: false,
        index: true
    },
    userId: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
});

// Index composé pour les requêtes fréquentes
actionSchema.index({ alertId: 1, timestamp: -1 });
actionSchema.index({ userId: 1, timestamp: -1 });

const Action = mongoose.model('Action', actionSchema);

module.exports = Action;
