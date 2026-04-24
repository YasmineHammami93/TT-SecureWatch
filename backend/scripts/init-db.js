require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Alert = require('../models/Alert');

/**
 * Script d'initialisation de la base de données
 * Crée les utilisateurs par défaut (Yasmine & Ahmed) et vérifie la connexion
 */

const initDatabase = async () => {
    try {
        console.log('\n' + '='.repeat(60));
        console.log('🔧 INITIALISATION DE LA BASE DE DONNÉES');
        console.log('='.repeat(60) + '\n');

        // Connexion à MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/soc_alerts_db';
        console.log(`📡 Connexion à MongoDB: ${mongoUri}`);

        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connexion MongoDB établie\n');

        // Vérification et création de l'utilisateur Admin (Yasmine)
        console.log('👤 Vérification de l\'utilisateur admin (Yasmine)...');
        const adminExists = await User.findOne({ username: 'yasmine' });

        if (adminExists) {
            console.log('ℹ️  L\'utilisateur yasmine existe déjà');
            console.log(`   - Username: ${adminExists.username}`);
            console.log(`   - Email: ${adminExists.email}`);
            console.log(`   - Role: ${adminExists.role}`);
        } else {
            console.log('🔨 Création de l\'utilisateur admin par défaut (Yasmine)...');

            const admin = new User({
                username: 'yasmine',
                password: 'admin123', // Mot de passe par défaut
                email: process.env.ADMIN_EMAIL || 'yasmine@soc-tunisietelecom.tn',
                role: 'ADMIN',
                settings: {
                    emailNotifications: true,
                    contactEmail: process.env.ADMIN_EMAIL || 'yasmine@soc-tunisietelecom.tn'
                }
            });

            await admin.save();

            console.log('✅ Utilisateur admin créé avec succès');
            console.log('   - Username: yasmine');
            console.log('   - Password: admin123');
            console.log(`   - Email: ${admin.email}`);
            console.log('\n⚠️  IMPORTANT: Changez le mot de passe après la première connexion!\n');
        }

        // Création de l'analyste (Ahmed)
        const analystExists = await User.findOne({ username: 'ahmed' });

        if (!analystExists) {
            console.log('🔨 Création de l\'utilisateur analyste de test (Ahmed)...');

            const analyst = new User({
                username: 'ahmed',
                password: 'admin123',
                email: 'ahmed@soc-tunisietelecom.tn',
                role: 'ANALYSTE',
                settings: {
                    emailNotifications: true,
                    contactEmail: 'ahmed@soc-tunisietelecom.tn'
                }
            });

            await analyst.save();
            console.log('✅ Utilisateur analyste créé (ahmed / admin123)\n');
        }

        // Statistiques de la base
        const userCount = await User.countDocuments();
        const alertCount = await Alert.countDocuments();

        console.log('📊 STATISTIQUES DE LA BASE:');
        console.log(`   - Utilisateurs: ${userCount}`);
        console.log(`   - Alertes: ${alertCount}`);

        if (alertCount === 0) {
            console.log('\n💡 Aucune alerte dans la base.');
            console.log('   Lancez le serveur pour synchroniser automatiquement les alertes SIEM.');
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ INITIALISATION TERMINÉE AVEC SUCCÈS');
        console.log('='.repeat(60) + '\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ ERREUR LORS DE L\'INITIALISATION:', error.message);
        console.error(error);
        process.exit(1);
    }
};

// Exécution
initDatabase();
