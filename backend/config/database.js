const mongoose = require('mongoose');

const connectDatabase = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/soc_alerts_db';

        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connecté à MongoDB:', mongoURI);

        // Gestion des événements de connexion
        mongoose.connection.on('error', (err) => {
            console.error('❌ Erreur MongoDB:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB déconnecté');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnecté');
        });

        return mongoose.connection;
    } catch (error) {
        console.error('❌ Erreur de connexion MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDatabase;
