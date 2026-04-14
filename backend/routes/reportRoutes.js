const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Alert = require('../models/Alert');
const Action = require('../models/Action');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/reports
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });

        // Seed initial data if empty
        if (reports.length === 0) {
            const initial = [
                { name: 'Bilan de Sécurité Hebdomadaire', type: 'Hebdomadaire', date: '2026-03-23', author: 'ahmed.analyste', size: '2.4 MB', status: 'ready' },
                { name: 'Audit de Conformité ISO 27001', type: 'Conformité', date: '2026-03-15', author: 'yasmine.admin', size: '4.8 MB', status: 'ready' },
                { name: 'Rapport Exécutif Mensuel (Février)', type: 'Exécutif', date: '2026-03-01', author: 'ahmed.analyste', size: '1.2 MB', status: 'ready' },
                { name: 'Analyse des Menaces Avancées', type: 'Technique', date: '2026-02-28', author: 'yasmine.admin', size: '8.6 MB', status: 'ready' }
            ];
            await Report.insertMany(initial);
            return res.json({ success: true, data: initial });
        }

        res.json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

/**
 * GET /api/reports/export-csv
 * Génère un export CSV réel de toutes les alertes (Dataset ToN-IoT) avec filtrage par date
 */
router.get('/export-csv', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = {};

        // Application du filtrage par date si disponible (Scenario Nominal)
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) {
                // Pour inclure toute la journée de fin, on met l'heure à 23:59:59
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.timestamp.$lte = end;
            }
        }

        const alerts = await Alert.find(query).sort({ timestamp: -1 });

        // Création du CSV (Entête)
        let csvContent = "ID;Date;Source;IP_Source;IP_Dest;Severite;Statut;Description;Score_Risque;Type_Attaque;Logs_Techniques\n";

        // Remplissage avec les données
        alerts.forEach(alert => {
            const row = [
                alert.id,
                new Date(alert.timestamp).toLocaleString(),
                alert.source,
                alert.sourceIp || '',
                alert.destinationIp || '',
                alert.severity,
                alert.status,
                `"${alert.description.replace(/"/g, '""')}"`,
                alert.mlData?.riskScore || 0,
                alert.technicalData?.type || 'N/A',
                `"${JSON.stringify(alert.technicalData || {}).replace(/"/g, '""')}"`
            ];
            csvContent += row.join(';') + "\n";
        });

        // Configuration des headers pour le téléchargement
        const fileName = `Rapport_SOC_Alertes_${new Date().toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        
        // Ajout du BOM pour l'affichage correct des accents dans Excel
        res.status(200).send("\uFEFF" + csvContent);

    } catch (error) {
        console.error('[REPORT] Erreur export CSV:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de la génération de l\'export' });
    }
});

/**
 * POST /api/reports
 * Simuler la génération d'un rapport dans la liste
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, type, startDate, endDate } = req.body;
        
        let reportName = name;
        if (!reportName) {
            const period = (startDate && endDate) ? ` (${startDate} au ${endDate})` : '';
            reportName = `Rapport ${type || 'Technique'}${period}`;
        }

        const report = new Report({
            name: reportName,
            type: type || 'Technique',
            author: req.user.username,
            status: 'ready'
        });
        await report.save();

        await Action.create({
            userId: req.user.id,
            action: 'REPORT_GENERATE',
            details: `Rapport généré: ${report.name}`
        });

        res.status(201).json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur génération' });
    }
});

module.exports = router;
