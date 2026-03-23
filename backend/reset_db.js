const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/soc_alerts_db')
    .then(async () => {
        console.log('Connecté à MongoDB, suppression des alertes...');
        await mongoose.connection.db.collection('alerts').deleteMany({});
        console.log('✅ Base de données nettoyée !');
        process.exit(0);
    })
    .catch(err => {
        console.error('Erreur:', err);
        process.exit(1);
    });
