const express = require('express');
const router = express.Router();
const { sendAlertEmail } = require('../services/emailService');
const Action = require('../models/Action');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const Notification = require('../models/Notification');

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
        await Action.create({
            userId: req.user.id,
            action: 'MISC_TEST_EMAIL',
            details: `Test email envoyé à: ${email}`
        });
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
// POST /notify-soc - Send SOC notification for an alert
router.post('/notify-soc', authenticateToken, async (req, res) => {
    const { alertId, alertData, message } = req.body;
    
    // 1. Create DB Notification for UI Toast / History
    try {
        const newNotif = new Notification({
            message: message || `Alerte Critique détectée : ${alertData?.description || 'Nouveau incident'}`,
            type: alertData?.severity === 'CRITIQUE' ? 'critique' : 'alert',
            alertId: alertId,
            sender: req.user.username
        });
        await newNotif.save();
        console.log(`[NOTIF] DB Notification created by ${req.user.username}`);
    } catch (err) {
        console.error('[NOTIF] Erreur creation DB Notif:', err);
    }

    // 2. Send to configured SOC email (Legacy)
    const socEmail = process.env.EMAIL_SENDER || 'soc@tunisietelecom.tn';
    
    // ... existing email logic ...
    const alertPayload = {
        description: alertData?.description || message || 'Alerte de sécurité',
        predictedClass: alertData?.description || 'Alerte SOC',
        riskScore: alertData?.mlData?.riskScore || 75,
        sourceIp: alertData?.sourceIp || 'N/A',
        severity: alertData?.severity || 'HAUTE',
        recommendation: `Action immédiate requise. Alerte ID: ${alertId}. Source: ${alertData?.source || 'Inconnue'}.`
    };

    try {
        const success = await sendAlertEmail(socEmail, alertPayload);
        if (success) {
            await Action.create({
                userId: req.user.id,
                alertId: alertId,
                action: 'MISC_NOTIFY_SOC',
                details: `Notification SOC envoyée pour l'alerte: ${alertId}`
            });
            res.json({ success: true, message: `Notification SOC envoyée et archivée.` });
        } else {
            res.json({ success: true, message: `Archivé en base, mais erreur envoi email.` });
        }
    } catch (err) {
        console.error('[Notify SOC] Erreur:', err);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

/**
 * GET /api/notifications
 * Récupérer les dernières notifications pour le SOC
 */
router.get('/notifications', authenticateToken, async (req, res) => {
    try {
        const notifications = await Notification.find()
            .sort({ createdAt: -1 })
            .limit(20);
        res.json({ status: 'success', data: notifications });
    } catch (err) {
        res.status(500).json({ error: 'Erreur récupération' });
    }
});

module.exports = router;
