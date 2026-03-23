const User = require('../models/User');

// Récupérer tous les utilisateurs (Admin seulement)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        console.log(`[Users] Liste des utilisateurs récupérée par ${req.user.username}`);
        res.json(users);
    } catch (err) {
        console.error('[Users] Erreur récupération:', err);
        res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
    }
};

// Récupérer un utilisateur par ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.json(user);
    } catch (err) {
        console.error('[Users] Erreur récupération utilisateur:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Créer un nouvel utilisateur (Admin seulement)
exports.createUser = async (req, res) => {
    try {
        const { username, password, email, role } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Nom d\'utilisateur ou email déjà utilisé' });
        }

        const user = new User({ username, password, email, role });
        await user.save();

        console.log(`[Users] Nouvel utilisateur créé: ${username} par ${req.user.username}`);
        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('[Users] Erreur création:', err);
        res.status(400).json({ error: 'Erreur lors de la création de l\'utilisateur' });
    }
};

// Mettre à jour un utilisateur (Admin seulement)
exports.updateUser = async (req, res) => {
    try {
        const { username, email, role, settings } = req.body;

        const updateData = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (settings) updateData.settings = settings;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        console.log(`[Users] Utilisateur ${user.username} mis à jour par ${req.user.username}`);
        res.json({
            message: 'Utilisateur mis à jour',
            user
        });
    } catch (err) {
        console.error('[Users] Erreur mise à jour:', err);
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
};

// Supprimer un utilisateur (Admin seulement)
exports.deleteUser = async (req, res) => {
    try {
        // Empêcher la suppression de son propre compte
        if (req.params.id === req.user.id) {
            return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
        }

        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        console.log(`[Users] Utilisateur ${user.username} supprimé par ${req.user.username}`);
        res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (err) {
        console.error('[Users] Erreur suppression:', err);
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
};

// Changer le rôle d'un utilisateur (Admin seulement)
exports.changeUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!['ADMIN', 'ANALYSTE'].includes(role)) {
            return res.status(400).json({ error: 'Rôle invalide' });
        }

        // Empêcher de changer son propre rôle
        if (req.params.id === req.user.id) {
            return res.status(400).json({ error: 'Vous ne pouvez pas changer votre propre rôle' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        console.log(`[Users] Rôle de ${user.username} changé en ${role} par ${req.user.username}`);
        res.json({
            message: 'Rôle mis à jour',
            user
        });
    } catch (err) {
        console.error('[Users] Erreur changement rôle:', err);
        res.status(500).json({ error: 'Erreur lors du changement de rôle' });
    }
};
