const Alert = require('../models/Alert');
const { processAlertWithML } = require('../services/mlService');
const Action = require('../models/Action');

// Récupérer toutes les alertes avec filtres
exports.getAllAlerts = async (req, res) => {
    try {
        const { source, severity, status, search, limit = 100 } = req.query;

        let query = {};

        // 1. Gestion du filtrage par Sévérité (avec cas spécial Faux Positifs)
        if (severity) {
            let mappedSev = severity.toUpperCase();
            if (mappedSev === 'FAUX POSITIF') {
                query['mlData.predictedClass'] = 'Normal';
            } else {
                if (mappedSev === 'ÉLEVÉE' || mappedSev === 'ELEVEE') mappedSev = 'HAUTE';
                query.severity = mappedSev;
                // Exclure les faux positifs des listes normales si on cherche une sévérité précise
                query['mlData.predictedClass'] = { $ne: 'Normal' };
            }
        }

        // 2. Autres filtres simples
        if (source) query.source = source;
        if (status) query.status = status.toUpperCase();
        
        // 3. Recherche textuelle globale
        if (search) {
            query.$or = [
                { description: { $regex: search, $options: 'i' } },
                { id: { $regex: search, $options: 'i' } },
                { sourceIp: { $regex: search, $options: 'i' } },
                { source: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } }
            ];
        }

        const alerts = await Alert.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit.toString()));
            
        res.json(alerts);
    } catch (err) {
        console.error('[Alerts] Erreur récupération:', err);
        res.status(500).json({ error: 'Erreur lors de la récupération des alertes' });
    }
};

// Récupérer les alertes assignées à l'utilisateur
exports.getAssignedAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find({ assignedTo: req.user.id })
            .sort({ timestamp: -1 });
        res.json(alerts);
    } catch (err) {
        console.error('[Alerts] Erreur alertes assignées:', err);
        res.status(500).json({ error: 'Erreur lors de la récupération' });
    }
};

// Récupérer une alerte par ID (Supporte ID personnalisé et ObjectId)
exports.getAlertById = async (req, res) => {
    try {
        const id = req.params.id;
        // Chercher d'abord par champ 'id' (format SIEM comme WZH-XXX)
        let alert = await Alert.findOne({ id: id });
        
        // Si pas trouvé et que c'est un format ObjectId valide, chercher par _id
        if (!alert && id.match(/^[0-9a-fA-F]{24}$/)) {
            alert = await Alert.findById(id);
        }

        if (!alert) {
            return res.status(404).json({ error: 'Alerte non trouvée' });
        }
        res.json(alert);
    } catch (err) {
        console.error('[Alerts] Erreur récupération alerte:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Mettre à jour une alerte
exports.updateAlert = async (req, res) => {
    try {
        const { status, severity, assignedTo, notes } = req.body;

        const updateData = {};
        if (status) {
            updateData.status = status;
            if (status === 'RÉSOLU') {
                updateData.resolvedAt = new Date();
            }
        }
        if (severity) updateData.severity = severity;
        if (assignedTo) updateData.assignedTo = assignedTo;
        if (notes) updateData.notes = notes;

        const id = req.params.id;
        const alert = await Alert.findOneAndUpdate(
            { $or: [{ id: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
            updateData,
            { new: true }
        );

        if (!alert) {
            return res.status(404).json({ error: 'Alerte non trouvée' });
        }

        // Enregistrer l'action
        await Action.create({
            alertId: alert.id,
            userId: req.user.id,
            action: 'UPDATE',
            details: `Mise à jour: ${Object.keys(updateData).join(', ')}`,
            timestamp: new Date()
        });

        console.log(`[Alerts] Alerte ${req.params.id} mise à jour par ${req.user.username}`);
        res.json(alert);
    } catch (err) {
        console.error('[Alerts] Erreur mise à jour:', err);
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
};

// Supprimer une alerte (Admin seulement)
exports.deleteAlert = async (req, res) => {
    try {
        const alert = await Alert.findOneAndDelete({ id: req.params.id });

        if (!alert) {
            return res.status(404).json({ error: 'Alerte non trouvée' });
        }

        // Enregistrer l'action
        await Action.create({
            alertId: req.params.id,
            userId: req.user.id,
            action: 'DELETE',
            details: `Alerte supprimée: ${alert.description}`,
            timestamp: new Date()
        });

        console.log(`[Alerts] Alerte ${req.params.id} supprimée par ${req.user.username}`);
        res.json({ message: 'Alerte supprimée avec succès' });
    } catch (err) {
        console.error('[Alerts] Erreur suppression:', err);
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
};

// Assigner une alerte
exports.assignAlert = async (req, res) => {
    try {
        const { userId } = req.body;

        const alert = await Alert.findOneAndUpdate(
            { id: req.params.id },
            { assignedTo: userId },
            { new: true }
        );

        if (!alert) {
            return res.status(404).json({ error: 'Alerte non trouvée' });
        }

        // Enregistrer l'action
        await Action.create({
            alertId: alert.id,
            userId: req.user.id,
            action: 'ASSIGN',
            details: `Assignée à l'utilisateur ${userId}`,
            timestamp: new Date()
        });

        console.log(`[Alerts] Alerte ${req.params.id} assignée à ${userId}`);
        res.json(alert);
    } catch (err) {
        console.error('[Alerts] Erreur assignation:', err);
        res.status(500).json({ error: 'Erreur lors de l\'assignation' });
    }
};

// Ajouter un commentaire
exports.addComment = async (req, res) => {
    try {
        const { comment } = req.body;

        const alert = await Alert.findOne({ id: req.params.id });
        if (!alert) {
            return res.status(404).json({ error: 'Alerte non trouvée' });
        }

        if (!alert.comments) alert.comments = [];

        alert.comments.push({
            userId: req.user.id,
            username: req.user.username,
            comment: comment,
            timestamp: new Date()
        });

        await alert.save();

        // Enregistrer l'action
        await Action.create({
            alertId: alert.id,
            userId: req.user.id,
            action: 'COMMENT',
            details: `Commentaire ajouté`,
            timestamp: new Date()
        });

        console.log(`[Alerts] Commentaire ajouté à ${req.params.id} par ${req.user.username}`);
        res.json(alert);
    } catch (err) {
        console.error('[Alerts] Erreur ajout commentaire:', err);
        res.status(500).json({ error: 'Erreur lors de l\'ajout du commentaire' });
    }
};

// Analyser une alerte avec ML
exports.analyzeAlert = async (req, res) => {
    try {
        const alert = await Alert.findOne({ id: req.params.id });
        if (!alert) {
            return res.status(404).json({ error: 'Alerte non trouvée' });
        }

        console.log(`[Alerts] Analyse ML demandée pour ${req.params.id} par ${req.user.username}`);

        // Appel au service ML
        const mlResult = await processAlertWithML(alert.toObject(), req.user);

        if (!mlResult) {
            return res.status(500).json({ error: 'Service ML indisponible' });
        }

        // Enregistrer l'action
        await Action.create({
            alertId: alert.id,
            userId: req.user.id,
            action: 'ANALYZE',
            details: `Analyse ML: ${mlResult.riskLevel} (Score: ${mlResult.riskScore})`,
            timestamp: new Date()
        });

        res.json(mlResult);
    } catch (err) {
        console.error('[Alerts] Erreur analyse ML:', err);
        res.status(500).json({ error: 'Erreur lors de l\'analyse' });
    }
};
