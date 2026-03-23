const express = require('express');
const router = express.Router();
const { sendAlertEmail } = require('../services/emailService');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// POST /test-email
router.post('/test-email', authenticateToken, isAdmin, async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis' });

    // Mock alert for testing
    const mockAlert = {
        description: "TEST DE NOTIFICATION SOC",
        predictedClass: "Test Manuel de Notification",
        riskScore: 50,
        sourceIp: "127.0.0.1",
        severity: "MOYENNE",
        recommendation: "Ceci est un test de vérification du système de messagerie."
    };

    const success = await sendAlertEmail(email, mockAlert);
    if (success) {
        res.json({ message: 'Email de test envoyé avec succès' });
    } else {
        res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email' });
    }
});

// GET /health
router.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

module.exports = router;
