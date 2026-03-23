const express = require('express');
const router = express.Router();
const SIEMCollectors = require('../collectors/siem_collectors');
const { authenticateToken, isAdmin } = require('../middleware/auth');

/**
 * Routes de collecte SIEM
 * Base URL: /api/collectors
 */

/**
 * POST /api/collectors/sync
 * Synchroniser manuellement toutes les sources SIEM
 */
router.post('/sync', authenticateToken, isAdmin, async (req, res) => {
    try {
        console.log(`[Collectors] 🔄 Synchronisation manuelle demandée par ${req.user.username}`);

        const newAlerts = await SIEMCollectors.syncAll();

        res.json({
            success: true,
            message: `Synchronisation terminée`,
            data: {
                newAlerts: newAlerts.length,
                alerts: newAlerts
            }
        });

    } catch (error) {
        console.error('[Collectors] ❌ Erreur synchronisation:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la synchronisation'
        });
    }
});

/**
 * POST /api/collectors/sync/:source
 * Synchroniser une source SIEM spécifique
 */
router.post('/sync/:source', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { source } = req.params;

        const validSources = ['wazuh', 'qradar', 'defender'];
        if (!validSources.includes(source.toLowerCase())) {
            return res.status(400).json({
                success: false,
                error: `Source invalide. Utilisez: ${validSources.join(', ')}`
            });
        }

        console.log(`[Collectors] 🔄 Synchronisation ${source} demandée par ${req.user.username}`);

        let newAlerts = [];

        switch (source.toLowerCase()) {
            case 'wazuh':
                newAlerts = await SIEMCollectors.syncWazuh();
                break;
            case 'qradar':
                newAlerts = await SIEMCollectors.syncQRadar();
                break;
            case 'defender':
                newAlerts = await SIEMCollectors.syncDefender();
                break;
        }

        res.json({
            success: true,
            message: `Synchronisation ${source} terminée`,
            data: {
                source: source,
                newAlerts: newAlerts.length,
                alerts: newAlerts
            }
        });

    } catch (error) {
        console.error(`[Collectors] ❌ Erreur synchronisation ${req.params.source}:`, error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la synchronisation'
        });
    }
});

/**
 * GET /api/collectors/status
 * Obtenir le statut des collecteurs SIEM
 */
router.get('/status', authenticateToken, async (req, res) => {
    try {
        const Alert = require('../models/Alert');

        // Compter les alertes par source
        const wazuhCount = await Alert.countDocuments({ source: 'Wazuh' });
        const qradarCount = await Alert.countDocuments({ source: 'IBM QRadar' });
        const defenderCount = await Alert.countDocuments({ source: 'Microsoft Defender' });

        // Dernière alerte collectée par source
        const lastWazuh = await Alert.findOne({ source: 'Wazuh' }).sort({ timestamp: -1 });
        const lastQRadar = await Alert.findOne({ source: 'IBM QRadar' }).sort({ timestamp: -1 });
        const lastDefender = await Alert.findOne({ source: 'Microsoft Defender' }).sort({ timestamp: -1 });

        res.json({
            success: true,
            data: {
                sources: [
                    {
                        name: 'Wazuh',
                        status: 'active',
                        totalAlerts: wazuhCount,
                        lastSync: lastWazuh?.timestamp || null
                    },
                    {
                        name: 'IBM QRadar',
                        status: 'active',
                        totalAlerts: qradarCount,
                        lastSync: lastQRadar?.timestamp || null
                    },
                    {
                        name: 'Microsoft Defender',
                        status: 'active',
                        totalAlerts: defenderCount,
                        lastSync: lastDefender?.timestamp || null
                    }
                ]
            }
        });

    } catch (error) {
        console.error('[Collectors] ❌ Erreur statut:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération du statut'
        });
    }
});

module.exports = router;
