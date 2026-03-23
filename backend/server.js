const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// ================= SERVICES =================
const { sendAlertEmail } = require('./services/emailService');
const { startBackgroundMonitoring } = require('./services/monitoringService');
const { processAlertWithML } = require('./services/mlService');

// ================= MODELS =================
const Alert = require('./models/Alert');
const User = require('./models/User');
const SIEMCollectors = require('./collectors/siem_collectors');

// ================= ROUTES =================
const authRoutes = require('./routes/authRoutes');
const alertRoutes = require('./routes/alertRoutes');
const userRoutes = require('./routes/userRoutes');
const collectorRoutes = require('./routes/collectorRoutes');
const statsRoutes = require('./routes/statsRoutes');
const playbookRoutes = require('./routes/playbookRoutes');
const miscRoutes = require('./routes/miscRoutes');

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= CONNEXION MONGODB =================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/soc_alerts_db')
  .then(async () => {
    console.log('✅ Connecté à MongoDB');

    // Synchronisation initiale si base vide
    const count = await Alert.countDocuments();
    if (count === 0) {
      console.log('[STARTUP] Base vide, synchronisation initiale...');
      await SIEMCollectors.syncAll();
    }

    // Création admin par défaut si absent
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      console.log('[STARTUP] Création utilisateur admin par défaut...');

      const admin = new User({
        username: 'admin',
        password: 'password123',
        email: 'yasminehammami97@gmail.com',
        role: 'ADMIN'
      });

      await admin.save();
      console.log('[OK] Admin créé: admin / password123 (email: yasminehammami97@gmail.com)');
    }

    // 🔥 Démarrer monitoring après connexion DB
    setTimeout(startBackgroundMonitoring, 5000);

  })
  .catch(err => console.error('[ERR] Erreur connexion MongoDB:', err));

// ================= ROUTES API =================
app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/users', userRoutes);
app.use('/api/collectors', collectorRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/playbooks', playbookRoutes);
app.use('/api', miscRoutes);

// ================= HEALTH CHECK =================
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// ================= START SERVER =================
app.listen(port, () => {
  console.log(`🚀 Backend TT SecureWatch démarré sur http://localhost:${port}`);
  console.log(`📊 API: http://localhost:${port}/api`);
  console.log(`🔐 Health: http://localhost:${port}/health`);
});
