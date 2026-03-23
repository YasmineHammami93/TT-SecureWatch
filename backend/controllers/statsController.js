const Alert = require('../models/Alert');

// Statistiques globales
exports.getGlobalStats = async (req, res) => {
    try {
        const alerts = await Alert.find();

        // 1. Calcul MTTR (Temps Moyen de Résolution)
        const resolvedAlerts = alerts.filter(a => a.status === 'RÉSOLU');
        let totalTime = 0;
        resolvedAlerts.forEach(a => {
            // Simulation du temps de résolution (en minutes)
            totalTime += (Math.random() * 24 * 60);
        });
        const mttr = resolvedAlerts.length > 0 ? Math.round(totalTime / resolvedAlerts.length) : 45;

        // 2. Taux de Faux Positifs
        const fpCount = alerts.filter(a => a.status === 'FAUX POSITIF').length;
        const fpRate = alerts.length > 0 ? ((fpCount / alerts.length) * 100).toFixed(1) : 0;

        // 3. Distribution par Status
        const statusCounts = {
            NOUVEAU: alerts.filter(a => a.status === 'NOUVEAU').length,
            'EN COURS': alerts.filter(a => a.status === 'EN COURS').length,
            RÉSOLU: alerts.filter(a => a.status === 'RÉSOLU').length,
            'FAUX POSITIF': alerts.filter(a => a.status === 'FAUX POSITIF').length,
        };

        // 4. Distribution par Sévérité
        const severityCounts = {
            CRITIQUE: alerts.filter(a => a.severity === 'CRITIQUE').length,
            HAUTE: alerts.filter(a => a.severity === 'HAUTE').length,
            MOYENNE: alerts.filter(a => a.severity === 'MOYENNE').length,
            FAIBLE: alerts.filter(a => a.severity === 'FAIBLE').length,
            INFO: alerts.filter(a => a.severity === 'INFO').length,
        };

        // 5. Distribution par Source
        const sourceCounts = {};
        alerts.forEach(a => {
            sourceCounts[a.source] = (sourceCounts[a.source] || 0) + 1;
        });

        res.json({
            mttr: `${mttr} min`,
            fpRate: `${fpRate}%`,
            totalAlerts: alerts.length,
            statusCounts,
            severityCounts,
            sourceCounts
        });
    } catch (err) {
        console.error('[Stats] Erreur statistiques globales:', err);
        res.status(500).json({ error: 'Erreur lors du calcul des statistiques' });
    }
};

// Statistiques détaillées par période
exports.getDetailedStats = async (req, res) => {
    try {
        const { period = '24h' } = req.query;

        // Calcul de la date de début selon la période
        let startDate = new Date();
        switch (period) {
            case '24h':
                startDate.setHours(startDate.getHours() - 24);
                break;
            case '7d':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(startDate.getDate() - 30);
                break;
            default:
                startDate.setHours(startDate.getHours() - 24);
        }

        const alerts = await Alert.find({
            timestamp: { $gte: startDate }
        });

        // Alertes par jour
        const alertsByDay = {};
        alerts.forEach(a => {
            const day = new Date(a.timestamp).toISOString().split('T')[0];
            alertsByDay[day] = (alertsByDay[day] || 0) + 1;
        });

        // Alertes critiques
        const criticalAlerts = alerts.filter(a => a.severity === 'CRITIQUE').length;

        // Alertes avec ML
        const mlAnalyzedAlerts = alerts.filter(a => a.mlData && a.mlData.riskScore).length;

        // Taux d'automatisation
        const automatedAlerts = alerts.filter(a => a.mlData && a.mlData.isAutomated).length;
        const automationRate = alerts.length > 0 ? ((automatedAlerts / alerts.length) * 100).toFixed(1) : 0;

        // Top systèmes affectés
        const systemCounts = {};
        alerts.forEach(a => {
            if (a.affectedSystem) {
                systemCounts[a.affectedSystem] = (systemCounts[a.affectedSystem] || 0) + 1;
            }
        });

        const topSystems = Object.entries(systemCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([system, count]) => ({ system, count }));

        res.json({
            period,
            totalAlerts: alerts.length,
            criticalAlerts,
            mlAnalyzedAlerts,
            automationRate: `${automationRate}%`,
            alertsByDay,
            topSystems
        });
    } catch (err) {
        console.error('[Stats] Erreur statistiques détaillées:', err);
        res.status(500).json({ error: 'Erreur lors du calcul des statistiques détaillées' });
    }
};
