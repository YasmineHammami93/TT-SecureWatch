const SIEMCollectors = require('../collectors/siem_collectors');
const { processAlertWithML } = require('./mlService');

let monitoringInterval = null;

// Démarrer la surveillance automatique
const startBackgroundMonitoring = () => {
    console.log('[Monitoring] Démarrage de la surveillance automatisée (Interval: 2 min)');

    // Éviter les doublons
    if (monitoringInterval) {
        console.log('[Monitoring] Surveillance déjà active');
        return;
    }

    monitoringInterval = setInterval(async () => {
        try {
            console.log('[Monitoring] Synchronisation automatique en cours...');

            // Récupération des nouvelles alertes depuis les collecteurs
            const newAlerts = await SIEMCollectors.syncAll();

            if (newAlerts.length > 0) {
                console.log(`[Monitoring] ${newAlerts.length} nouvelles alertes détectées. Analyse IA en cours...`);

                // Analyse automatique de chaque nouvelle alerte
                for (const alert of newAlerts) {
                    await processAlertWithML(alert.toObject());
                }

                console.log(`[Monitoring] Analyse terminée pour ${newAlerts.length} alertes`);
            } else {
                console.log('[Monitoring] Aucune nouvelle alerte');
            }
        } catch (err) {
            console.error('[Monitoring] Erreur:', err);
        }
    }, 2 * 60 * 1000); // 2 minutes
};

// Arrêter la surveillance
const stopBackgroundMonitoring = () => {
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
        console.log('[Monitoring] Surveillance arrêtée');
    }
};

// Statut de la surveillance
const getMonitoringStatus = () => {
    return {
        isActive: monitoringInterval !== null,
        interval: '2 minutes'
    };
};

module.exports = {
    startBackgroundMonitoring,
    stopBackgroundMonitoring,
    getMonitoringStatus
};
