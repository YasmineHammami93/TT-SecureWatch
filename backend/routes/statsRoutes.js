const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const statsController = require('../controllers/statsController');

// Routes pour les statistiques
router.get('/', authenticateToken, statsController.getGlobalStats);
router.get('/detailed', authenticateToken, statsController.getDetailedStats);

module.exports = router;
