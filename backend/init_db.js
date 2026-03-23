const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/soc_alerts_db';

const initDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connecté à MongoDB pour initialisation...');

        // Créer l'administrateur par défaut
        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            const admin = new User({
                username: 'admin',
                password: 'password123',
                email: 'yasminehammami97@gmail.com',
                role: 'ADMIN'
            });
            await admin.save();
            console.log('✅ Utilisateur ADMIN créé avec succès (admin / password123)');
        } else {
            console.log('ℹ️ L\'utilisateur ADMIN existe déjà.');
            // On met à jour l'email si nécessaire
            adminExists.email = 'yasminehammami97@gmail.com';
            await adminExists.save();
            console.log('✅ Email mis à jour pour l\'admin.');
        }

        mongoose.connection.close();
    } catch (err) {
        console.error('❌ Erreur initialisation base:', err);
        process.exit(1);
    }
};

initDB();
