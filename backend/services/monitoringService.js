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
            // Récupération des nouvelles alertes depuis les collecteurs (Analyse IA déjà incluse dans syncAll)
            const newAlerts = await SIEMCollectors.syncAll();

            if (newAlerts && newAlerts.length > 0) {
                console.log(`[Monitoring] ${newAlerts.length} nouvelles alertes réelles détectées et analysées par l'IA.`);
            } else {
                console.log('[Monitoring] Aucune nouvelle activité détectée sur le réseau.');
            }
        } catch (err) {
            console.error('[Monitoring] Erreur:', err);
        }
    }, 30 * 1000); // 30 secondes pour la démo
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
