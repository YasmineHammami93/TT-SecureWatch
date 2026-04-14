const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Action = require('../models/Action');

/**
 * Routes de playbooks SOC
 * Base URL: /api/playbooks
 * (Fonctionnalité à implémenter dans les sprints futurs)
 */const Playbook = require('../models/Playbook');

/**
 * GET /api/playbooks
 * Récupérer tous les playbooks disponibles
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const playbooks = await Playbook.find().sort({ createdAt: -1 });

        // Seed initial data if empty
        if (playbooks.length === 0) {
            const initial = [
                { name: 'Appliquer Blocage Pare-Feu', description: 'Blacklister les adresses IPs malveillantes détectées (DDoS/Scan).', trigger: 'Toutes', incidentType: 'DDoS', actions: ['Block IP'], parameters: { notifications: true, ipBlocking: true } },
                { name: 'Isoler Machine (EDR)', description: 'Déconnexion du réseau pour contrer un Ransomware ou Malware.', trigger: 'Critique', incidentType: 'Malware', actions: ['Isolate Host'], parameters: { notifications: true, ipBlocking: false } },
                { name: 'Désactiver Compte AD', description: 'Suspendre l\'accès utilisateur en cas d\'intrusion ou Bruteforce.', trigger: 'Bruteforce', incidentType: 'Bruteforce', actions: ['Disable Account'], parameters: { notifications: true, ipBlocking: false } }
            ];
            await Playbook.insertMany(initial);
            return res.json({ success: true, data: initial });
        }

        res.json({
            success: true,
            data: playbooks
        });

    } catch (error) {
        console.error('[Playbooks] ❌ Erreur récupération:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

/**
 * POST /api/playbooks
 * Créer un nouveau playbook (ADMIN)
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, description, trigger, incidentType, actions, parameters } = req.body;
        
        // Validation simple (Scénario alternatif)
        if (!name || !incidentType || !actions || actions.length === 0) {
            return res.status(400).json({ success: false, error: 'Informations incomplètes' });
        }

        const playbook = new Playbook({ name, description, trigger, incidentType, actions, parameters });
        await playbook.save();

        await Action.create({
            userId: req.user.id,
            action: 'PLAYBOOK_CREATE',
            details: `Playbook créé: ${name}`
        });

        res.status(201).json({ success: true, data: playbook });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur création playbook' });
    }
});

/**
 * PUT /api/playbooks/:id
 * Modifier un playbook
 */
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { name, description, trigger, incidentType, actions, parameters } = req.body;
        const playbook = await Playbook.findByIdAndUpdate(
            req.params.id, 
            { name, description, trigger, incidentType, actions, parameters }, 
            { new: true }
        );

        if (playbook) {
            await Action.create({
                userId: req.user.id,
                action: 'PLAYBOOK_UPDATE',
                details: `Playbook modifié: ${name}`
            });
        }

        res.json({ success: true, data: playbook });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur mise à jour playbook' });
    }
});

/**
 * DELETE /api/playbooks/:id
 * Supprimer un playbook
 */
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const playbook = await Playbook.findByIdAndDelete(req.params.id);
        
        if (playbook) {
            await Action.create({
                userId: req.user.id,
                action: 'PLAYBOOK_DELETE',
                details: `Playbook supprimé: ${playbook.name}`
            });
        }

        res.json({ success: true, message: 'Playbook supprimé' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur suppression playbook' });
    }
});

/**
 * POST /api/playbooks/:id/execute
 * Exécuter un playbook sur une alerte
 */
router.post('/:id/execute', authenticateToken, async (req, res) => {
    try {
        const { alertId } = req.body;
        const playbookId = req.params.id;

        if (!alertId) {
            return res.status(400).json({ success: false, error: 'ID d\'alerte requis' });
        }

        console.log(`[Playbooks] 🎯 Exécution playbook ${playbookId} sur alerte ${alertId} par ${req.user.username}`);

        // Créer une action dans l'historique
        const action = new Action({
            alertId: alertId,
            userId: req.user.id,
            action: 'PLAYBOOK_EXECUTE',
            details: `Exécution du playbook ${playbookId}`,
            metadata: { playbookId }
        });

        await action.save();

        res.json({
            success: true,
            message: `Playbook exécuté avec succès`,
            data: { actionId: action._id, status: 'executed' }
        });

    } catch (error) {
        console.error('[Playbooks] ❌ Erreur exécution:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

/**
 * GET /api/playbooks/history
 * Récupérer l'historique
 */
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const actions = await Action.find({ action: 'PLAYBOOK_EXECUTE' })
            .sort({ timestamp: -1 })
            .limit(50);
        res.json({ success: true, data: actions });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur historique' });
    }
});

module.exports = router;
