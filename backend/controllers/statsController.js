const Alert = require('../models/Alert');

// Statistiques globales
exports.getGlobalStats = async (req, res) => {
    try {
        const stats = await Alert.aggregate([
            {
                $facet: {
                    total: [{ $count: "count" }],
                    statusDistribution: [
                        { $group: { _id: "$status", count: { $sum: 1 } } }
                    ],
                    severityStats: [
                        {
                            $group: {
                                _id: "$severity",
                                count: { $sum: 1 },
                                avgScore: { $avg: "$mlData.riskScore" }
                            }
                        }
                    ],
                    sourceDistribution: [
                        { $group: { _id: "$source", count: { $sum: 1 } } }
                    ],
                    mttrStats: [
                        { $match: { status: 'RÉSOLU', resolvedAt: { $exists: true } } },
                        {
                            $project: {
                                diff: { $subtract: ["$resolvedAt", "$timestamp"] }
                            }
                        },
                        { $group: { _id: null, avgMs: { $avg: "$diff" } } }
                    ],
                    fpCount: [
                        { $match: { "mlData.predictedClass": "Normal" } },
                        { $count: "count" }
                    ]
                }
            }
        ]);

        const data = stats[0];
        const totalAlerts = data.total[0]?.count || 0;
        
        const statusCounts = { NOUVEAU: 0, 'EN COURS': 0, RÉSOLU: 0 };
        data.statusDistribution.forEach(s => {
            if (s._id) statusCounts[s._id] = s.count;
        });

        const severityCounts = {};
        const avgScores = {};
        data.severityStats.forEach(s => {
            if (s._id) {
                severityCounts[s._id] = s.count;
                avgScores[s._id] = Math.round(s.avgScore || 0);
            }
        });

        const sourceCounts = {};
        data.sourceDistribution.forEach(s => {
            if (s._id) sourceCounts[s._id] = s.count;
        });

        const mttrValue = data.mttrStats[0] ? Math.round(data.mttrStats[0].avgMs / 60000) : 45;
        const fpRate = totalAlerts > 0 ? (((data.fpCount[0]?.count || 0) / totalAlerts) * 100).toFixed(1) : 0;

        res.json({
            mttr: `${mttrValue} min`,
            fpRate: `${fpRate}%`,
            totalAlerts,
            statusCounts,
            severityCounts,
            avgScores,
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

        let startDate = new Date();
        switch (period) {
            case '24h': startDate.setHours(startDate.getHours() - 24); break;
            case '7d': startDate.setDate(startDate.getDate() - 7); break;
            case '30d': startDate.setDate(startDate.getDate() - 30); break;
            default: startDate.setHours(startDate.getHours() - 24);
        }

        const stats = await Alert.aggregate([
            { $match: { timestamp: { $gte: startDate } } },
            {
                $facet: {
                    total: [{ $count: "count" }],
                    byDay: [
                        {
                            $group: {
                                _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ],
                    criticalCount: [
                        { $match: { severity: 'CRITIQUE' } },
                        { $count: "count" }
                    ],
                    mlCount: [
                        { $match: { "mlData.riskScore": { $exists: true } } },
                        { $count: "count" }
                    ],
                    automatedCount: [
                        { $match: { "mlData.isAutomated": true } },
                        { $count: "count" }
                    ],
                    topSystems: [
                        { $match: { affectedSystem: { $exists: true, $ne: null } } },
                        { $group: { _id: "$affectedSystem", count: { $sum: 1 } } },
                        { $sort: { count: -1 } },
                        { $limit: 5 }
                    ]
                }
            }
        ]);

        const data = stats[0];
        const totalAlerts = data.total[0]?.count || 0;

        const alertsByDay = {};
        data.byDay.forEach(d => { alertsByDay[d._id] = d.count; });

        const automationRate = totalAlerts > 0 ? (((data.automatedCount[0]?.count || 0) / totalAlerts) * 100).toFixed(1) : 0;

        res.json({
            period,
            totalAlerts,
            criticalAlerts: data.criticalCount[0]?.count || 0,
            mlAnalyzedAlerts: data.mlCount[0]?.count || 0,
            automationRate: `${automationRate}%`,
            alertsByDay,
            topSystems: data.topSystems.map(s => ({ system: s._id, count: s.count }))
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
            accuracy: 99.22,
            recall: 99.28,
            precision: 99.21,
            f1Score: 99.24,
            totalSamples: 211043,
            distribution
        });
    } catch (err) {
        console.error('[Stats] Erreur statistiques dataset:', err);
        res.status(500).json({ error: 'Erreur lors du calcul des statistiques du dataset' });
    }
};

