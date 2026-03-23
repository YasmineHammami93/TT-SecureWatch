const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin, isAnalyst } = require('../middleware/auth');
const alertController = require('../controllers/alertController');

// Routes pour les alertes
router.get('/', authenticateToken, alertController.getAllAlerts);
router.get('/assigned', authenticateToken, alertController.getAssignedAlerts);
router.get('/:id', authenticateToken, alertController.getAlertById);
router.put('/:id', authenticateToken, isAnalyst, alertController.updateAlert);
router.delete('/:id', authenticateToken, isAdmin, alertController.deleteAlert);
router.post('/:id/assign', authenticateToken, isAdmin, alertController.assignAlert);
router.post('/:id/comments', authenticateToken, alertController.addComment);
router.post('/:id/analyze', authenticateToken, isAnalyst, alertController.analyzeAlert);

module.exports = router;
