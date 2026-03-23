const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Routes pour les utilisateurs (Admin seulement)
router.get('/', authenticateToken, isAdmin, userController.getAllUsers);
router.get('/:id', authenticateToken, isAdmin, userController.getUserById);
router.post('/', authenticateToken, isAdmin, userController.createUser);
router.put('/:id', authenticateToken, isAdmin, userController.updateUser);
router.delete('/:id', authenticateToken, isAdmin, userController.deleteUser);
router.patch('/:id/role', authenticateToken, isAdmin, userController.changeUserRole);

module.exports = router;
