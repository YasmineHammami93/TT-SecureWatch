const Alert = require('../models/Alert');

// Statistiques globales
exports.getGlobalStats = async (req, res) => {
    try {
        const alerts = await Alert.find();

        // 1. Calcul MTTR (Temps Moyen de Résolution) - RÉEL
        const resolvedAlerts = alerts.filter(a => a.status === 'RÉSOLU' && a.resolvedAt);
        let totalMs = 0;
        resolvedAlerts.forEach(a => {
            const diff = new Date(a.resolvedAt) - new Date(a.timestamp);
            totalMs += diff;
        });
        
        // MTTR en minutes. Si pas d'alertes résolues, on met 45 par défaut (simulation initiale cohérente)
        const mttrValue = resolvedAlerts.length > 0 ? Math.round(totalMs / (resolvedAlerts.length * 60000)) : 45;

        // 2. Taux de Faux Positifs (identifiés par ML)
        const fpCount = alerts.filter(a => a.mlData && a.mlData.predictedClass === 'Normal').length;
        const fpRate = alerts.length > 0 ? ((fpCount / alerts.length) * 100).toFixed(1) : 0;

        // 3. Distribution par Status
        const statusCounts = {
            NOUVEAU: alerts.filter(a => a.status === 'NOUVEAU').length,
            'EN COURS': alerts.filter(a => a.status === 'EN COURS').length,
            RÉSOLU: alerts.filter(a => a.status === 'RÉSOLU').length,
        };

        // 4. Distribution par Sévérité ET Score Moyen
        const severities = ['CRITIQUE', 'HAUTE', 'MOYENNE', 'FAIBLE', 'INFO'];
        const severityCounts = {};
        const avgScores = {};

        severities.forEach(sev => {
            const list = alerts.filter(a => a.severity === sev);
            severityCounts[sev] = list.length;
            
            // Calcul du score moyen pour cette catégorie
            const totalScore = list.reduce((acc, curr) => acc + (curr.mlData?.riskScore || 0), 0);
            avgScores[sev] = list.length > 0 ? Math.round(totalScore / list.length) : 0;
        });

        // 5. Distribution par Source
        const sourceCounts = {};
        alerts.forEach(a => {
            sourceCounts[a.source] = (sourceCounts[a.source] || 0) + 1;
        });

        res.json({
            mttr: `${mttrValue} min`,
            fpRate: `${fpRate}%`,
            totalAlerts: alerts.length,
            statusCounts,
            severityCounts,
            avgScores, // Nouvelle donnée pour le Dashboard
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

// Statistiques du dataset d'entraînement
exports.getMLDatasetStats = async (req, res) => {
    try {
        const distribution = {
            "normal": 50000,
            "backdoor": 20000,
            "ddos": 20000,
            "dos": 20000,
            "injection": 20000,
            "password": 20000,
            "ransomware": 20000,
            "scanning": 20000,
            "xss": 20000,
            "mitm": 1043
        };

        res.json({
            accuracy: 99.67,
            recall: 98.59,
            precision: 99.98,
            f1Score: 99.28,
            totalSamples: 211043,
            distribution
        });
    } catch (err) {
        console.error('[Stats] Erreur statistiques dataset:', err);
        res.status(500).json({ error: 'Erreur lors du calcul des statistiques du dataset' });
    }
};

