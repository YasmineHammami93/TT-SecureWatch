const express = require('express');
const router = express.Router();
const SIEMCollectors = require('../collectors/siem_collectors');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const Action = require('../models/Action');
const Collector = require('../models/Collector');

/**
 * GET /api/collectors
 * Récupérer tous les collecteurs (ADMIN)
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const collectors = await Collector.find().sort({ createdAt: -1 });

        // Seed initial data if empty
        if (collectors.length === 0) {
            const initial = [
                { name: 'Wazuh HIDS', url: 'https://wazuh.local:55000', status: 'Actif', lastSync: new Date() },
                { name: 'IBM QRadar', url: 'https://qradar.local/api', status: 'Actif', lastSync: new Date() },
                { name: 'MS Defender', url: 'https://api.securitycenter.microsoft.com', status: 'Inactif', lastSync: new Date() }
            ];
            await Collector.insertMany(initial);
            return res.json({ success: true, data: initial });
        }

        res.json({ success: true, data: collectors });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

/**
 * POST /api/collectors
 * Ajouter un collecteur
 */
router.post('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { name, url, status } = req.body;
        const collector = new Collector({ name, url, status });
        await collector.save();
        
        await Action.create({
            userId: req.user.id,
            action: 'COLLECTOR_CREATE',
            details: `Source SIEM ajoutée: ${name}`
        });

        res.status(201).json({ success: true, data: collector });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur création collecteur' });
    }
});

/**
 * PUT /api/collectors/:id
 * Modifier un collecteur
 */
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { name, url, status } = req.body;
        const collector = await Collector.findByIdAndUpdate(
            req.params.id, 
            { name, url, status }, 
            { new: true }
        );

        if (collector) {
            await Action.create({
                userId: req.user.id,
                action: 'COLLECTOR_UPDATE',
                details: `Source SIEM modifiée: ${name}`
            });
        }

        res.json({ success: true, data: collector });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur mise à jour collecteur' });
    }
});

/**
 * DELETE /api/collectors/:id
 * Supprimer un collecteur
 */
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const collector = await Collector.findByIdAndDelete(req.params.id);
        
        if (collector) {
            await Action.create({
                userId: req.user.id,
                action: 'COLLECTOR_DELETE',
                details: `Source SIEM supprimée: ${collector.name}`
            });
        }

        res.json({ success: true, message: 'Collecteur supprimé' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur suppression collecteur' });
    }
});

/**
 * POST /api/collectors/sync
 * Synchroniser manuellement toutes les sources SIEM
 */
router.post('/sync', authenticateToken, isAdmin, async (req, res) => {
    try {
        console.log(`[Collectors] 🔄 Synchronisation manuelle demandée par ${req.user.username}`);
        const newAlerts = await SIEMCollectors.syncAll();
        
        await Action.create({
            userId: req.user.id,
            action: 'COLLECTOR_SYNC',
            details: `Synchronisation manuelle SIEM lancée`
        });

        res.json({ success: true, message: `Synchronisation terminée`, data: { newAlerts: newAlerts.length } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur lors de la synchronisation' });
    }
});

/**
 * GET /api/collectors/status
 */
router.get('/status', authenticateToken, async (req, res) => {
    try {
        const collectors = await Collector.find();
        const Alert = require('../models/Alert');

        const sourcesWithStats = await Promise.all(collectors.map(async (c) => {
            const count = await Alert.countDocuments({ source: c.name });
            return {
                name: c.name,
                status: c.status === 'Actif' ? 'active' : 'inactive',
                totalAlerts: count,
                lastSync: c.lastSync
            };
        }));

        res.json({ success: true, data: { sources: sourcesWithStats } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur statut' });
    }
});

module.exports = router;

module.exports = router;
