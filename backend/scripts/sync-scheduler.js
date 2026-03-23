require('dotenv').config();
const mongoose = require('mongoose');
const SIEMCollectors = require('../collectors/siem_collectors');
const { processAlertWithML } = require('../services/monitoringService');

/**
 * Script de synchronisation planifiée
 * Peut être utilisé avec un cron job pour synchroniser périodiquement
 */

const syncScheduler = async () => {
    try {
        console.log('\n' + '='.repeat(60));
        console.log('🔄 SYNCHRONISATION PLANIFIÉE DES ALERTES SIEM');
        console.log('='.repeat(60));
        console.log(`⏰ Heure: ${new Date().toLocaleString('fr-FR')}\n`);

        // Connexion à MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/soc_alerts_db';
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connexion MongoDB établie\n');

        // Synchronisation de toutes les sources SIEM
        console.log('📡 Collecte des alertes depuis les sources SIEM...');
        const newAlerts = await SIEMCollectors.syncAll();

        if (newAlerts.length > 0) {
            console.log(`\n✨ ${newAlerts.length} nouvelles alertes collectées`);
            console.log('🧠 Analyse ML en cours...\n');

            // Analyse ML de chaque nouvelle alerte
            let processedCount = 0;
            for (const alert of newAlerts) {
                const result = await processAlertWithML(alert.toObject());
                if (result) {
                    processedCount++;
                    console.log(`   ✓ ${alert.id} → ${result.riskLevel}`);
                }
            }

            console.log(`\n✅ ${processedCount}/${newAlerts.length} alertes analysées avec succès`);
        } else {
            console.log('ℹ️  Aucune nouvelle alerte détectée');
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ SYNCHRONISATION TERMINÉE');
        console.log('='.repeat(60) + '\n');

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ ERREUR LORS DE LA SYNCHRONISATION:', error.message);
        console.error(error);
        process.exit(1);
    }
};

// Exécution
syncScheduler();
