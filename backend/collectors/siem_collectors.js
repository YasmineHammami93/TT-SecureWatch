/**
 * Module des Collecteurs SIEM (Security Information and Event Management)
 * Ce module a été mis à jour pour utiliser des données RÉELLES issues du dataset ToN-IoT.
 * Chaque alerte est maintenant analysée par l'Intelligence Artificielle.
 */

const Alert = require('../models/Alert');
const DatasetService = require('../services/datasetService');
const { processAlertWithML } = require('../services/mlService');

class SIEMCollectors {
    /**
     * Méthode générique pour simuler la récupération depuis une source SIEM.
     * Elle utilise le DatasetService pour obtenir des données réelles de trafic.
     */
    static async fetchRealAlertsFromDataset(count = 10) {
        console.log(`[COLLECTOR] Ingesting ${count} real records from ToN-IoT dataset...`);
        
        // Récupérer des lignes aléatoires du dataset CSV
        const rawRows = await DatasetService.getRandomRows(count);
        
        // Mapper les lignes CSV vers le format Alert du SOC
        const alerts = rawRows.map(row => {
            const baseAlert = DatasetService.mapRowToAlert(row);
            return {
                ...baseAlert,
                // Génération d'un ID unique pour éviter les doublons MongoDB
                id: (baseAlert.source.substring(0, 3) + '-' + Math.random().toString(36).substr(2, 9)).toUpperCase()
            };
        });

        return alerts;
    }

    /**
     * Méthode principale 'syncAll' : Orchestre la récupération et l'analyse IA.
     */
    static async syncAll() {
        console.log("[COLLECTOR] Starting synchronized real data ingestion...");
        
        // Récupération globale (elle contient un mix de sources grâce au mapping dans DatasetService)
        const newAlertsData = await this.fetchRealAlertsFromDataset(15);
        const syncedAlerts = [];

        for (const alertData of newAlertsData) {
            // 1. Création de l'instance initiale
            const alert = new Alert({
                ...alertData,
                timestamp: new Date(),
                status: 'NOUVEAU'
            });

            // 2. Sauvegarde initiale pour avoir l'ID en base
            await alert.save();

            // 3. 🔥 ANALYSE IA (Appel au modèle Random Forest via mlService)
            // Cette étape va enrichir l'alerte avec le score de risque et le verdict de l'IA
            console.log(`[AI] Analyzing alert ${alert.id} (Type: ${alertData.technicalData?.type || 'Unknown'})...`);
            await processAlertWithML(alert);

            // Récupérer l'alerte mise à jour par le ML
            const updatedAlert = await Alert.findOne({ id: alert.id });
            syncedAlerts.push(updatedAlert);
            
            console.log(`[OK] Alerte réelle synchronisée et analysée: ${alert.id} [Source: ${alert.source}]`);
        }

        return syncedAlerts;
    }

    // Méthodes legacy gardées pour la compatibilité si nécessaire (mais redirigées vers le dataset)
    static async fetchWazuhAlerts() { return this.fetchRealAlertsFromDataset(5); }
    static async fetchQRadarAlerts() { return this.fetchRealAlertsFromDataset(5); }
    static async fetchDefenderAlerts() { return this.fetchRealAlertsFromDataset(5); }
}

module.exports = SIEMCollectors;
 // Exporte la classe pour qu'elle soit utilisable dans server.js

