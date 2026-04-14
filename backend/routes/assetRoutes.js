const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const Action = require('../models/Action');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/assets
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const assets = await Asset.find();
        
        // Seed if empty
        if (assets.length === 0) {
            const initial = [
                { name: 'SRV-DC01', type: 'Serveur', ip: '192.168.1.10', os: 'Windows Server 2022', status: 'online' },
                { name: 'FW-PALO-01', type: 'Réseau', ip: '192.168.1.1', os: 'PAN-OS 11.1', status: 'online' },
                { name: 'WS-ANALYST-03', type: 'Poste', ip: '192.168.1.103', os: 'Windows 11 Pro', status: 'warning' },
                { name: 'NAS-BACKUP-01', type: 'Stockage', ip: '192.168.1.50', os: 'Synology DSM 7.2', status: 'online' },
                { name: 'SRV-SIEM-01', type: 'Serveur', ip: '192.168.1.20', os: 'Ubuntu 22.04 LTS', status: 'online' },
                { name: 'SW-CORE-01', type: 'Réseau', ip: '192.168.1.2', os: 'Cisco IOS XE', status: 'offline' }
            ];
            await Asset.insertMany(initial);
            return res.json({ success: true, data: initial });
        }

        res.json({ success: true, data: assets });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

/**
 * POST /api/assets
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const asset = new Asset(req.body);
        await asset.save();
        
        await Action.create({
            userId: req.user.id,
            action: 'ASSET_CREATE',
            details: `Nouvel asset ajouté: ${asset.name} (${asset.ip})`
        });

        res.status(201).json({ success: true, data: asset });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur création' });
    }
});

/**
 * PUT /api/assets/:id
 */
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        if (asset) {
            await Action.create({
                userId: req.user.id,
                action: 'ASSET_UPDATE',
                details: `Asset modifié: ${asset.name}`
            });
        }

        res.json({ success: true, data: asset });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur modification' });
    }
});

/**
 * DELETE /api/assets/:id
 */
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const asset = await Asset.findByIdAndDelete(req.params.id);
        
        if (asset) {
            await Action.create({
                userId: req.user.id,
                action: 'ASSET_DELETE',
                details: `Asset supprimé: ${asset.name}`
            });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur suppression' });
    }
});

module.exports = router;
