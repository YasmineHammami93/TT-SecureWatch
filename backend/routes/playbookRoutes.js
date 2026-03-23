const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Action = require('../models/Action');

/**
 * Routes de playbooks SOC
 * Base URL: /api/playbooks
 * (Fonctionnalité à implémenter dans les sprints futurs)
 */

/**
 * GET /api/playbooks
 * Récupérer tous les playbooks disponibles
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        // Playbooks prédéfinis (à étendre dans le futur)
        const playbooks = [
            {
                id: 'pb-001',
                name: 'Blocage IP Malveillante',
                description: 'Bloquer automatiquement une IP source malveillante sur le firewall',
                category: 'Network Security',
                automated: true,
                steps: [
                    'Vérifier la réputation de l\'IP',
                    'Ajouter l\'IP à la liste noire du firewall',
                    'Notifier l\'équipe SOC',
                    'Documenter l\'action'
                ]
            },
            {
                id: 'pb-002',
                name: 'Isolation Hôte Compromis',
                description: 'Isoler un hôte potentiellement compromis du réseau',
                category: 'Endpoint Security',
                automated: false,
                steps: [
                    'Identifier l\'hôte compromis',
                    'Désactiver les interfaces réseau',
                    'Capturer l\'état du système',
                    'Notifier l\'administrateur système'
                ]
            },
            {
                id: 'pb-003',
                name: 'Investigation Brute Force',
                description: 'Analyser et répondre à une tentative de brute force',
                category: 'Authentication',
                automated: false,
                steps: [
                    'Identifier la source de l\'attaque',
                    'Vérifier les comptes ciblés',
                    'Bloquer l\'IP source temporairement',
                    'Forcer la réinitialisation des mots de passe si nécessaire'
                ]
            }
        ];

        res.json({
            success: true,
            data: playbooks
        });

    } catch (error) {
        console.error('[Playbooks] ❌ Erreur récupération:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des playbooks'
        });
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
            return res.status(400).json({
                success: false,
                error: 'ID d\'alerte requis'
            });
        }

        console.log(`[Playbooks] 🎯 Exécution playbook ${playbookId} sur alerte ${alertId} par ${req.user.username}`);

        // Créer une action dans l'historique
        const action = new Action({
            alertId: alertId,
            type: 'playbook_execution',
            status: 'executed',
            executedBy: req.user.id,
            details: {
                playbookId: playbookId,
                executedAt: new Date()
            }
        });

        await action.save();

        res.json({
            success: true,
            message: `Playbook ${playbookId} exécuté avec succès`,
            data: {
                actionId: action._id,
                playbookId: playbookId,
                alertId: alertId,
                status: 'executed'
            }
        });

    } catch (error) {
        console.error('[Playbooks] ❌ Erreur exécution:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'exécution du playbook'
        });
    }
});

/**
 * GET /api/playbooks/history
 * Récupérer l'historique des exécutions de playbooks
 */
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const actions = await Action.find({ type: 'playbook_execution' })
            .sort({ executedAt: -1 })
            .limit(50)
            .populate('alertId')
            .populate('executedBy', 'username');

        res.json({
            success: true,
            data: actions
        });

    } catch (error) {
        console.error('[Playbooks] ❌ Erreur historique:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération de l\'historique'
        });
    }
});

module.exports = router;
