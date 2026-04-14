const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Action = require('../models/Action');

/**
 * ===============================
 * INSCRIPTION
 * ===============================
 */
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: "Tous les champs sont requis" });
    }

    if (username.trim().length < 3) {
      return res.status(400).json({ success: false, error: "Nom d'utilisateur trop court (min 3 caractères)" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, error: "Mot de passe trop court (min 8 caractères)" });
    }

    const existingUser = await User.findOne({
      $or: [
        { username: username.trim() },
        { email: email.toLowerCase().trim() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ success: false, error: "Utilisateur déjà existant" });
    }

    const newUser = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      role: "ANALYSTE"
    });

    await newUser.save();

    await Action.create({
      userId: newUser._id,
      action: 'USER_REGISTER',
      details: `Création de compte: ${username}`,
    });

    const token = jwt.sign(
      { id: newUser._id, username: newUser.username, role: newUser.role },
      process.env.JWT_SECRET || "secret_key_123",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Compte créé avec succès",
      token,
      user: { id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role }
    });

  } catch (error) {
    console.error("❌ Erreur inscription:", error);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
};


/**
 * ===============================
 * CONNEXION
 * ===============================
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: "Identifiant et mot de passe requis" });
    }

    const user = await User.findOne({
      $or: [{ username: username.trim() }, { email: username.trim() }]
    });

    if (!user) {
      return res.status(401).json({ success: false, error: "Identifiants incorrects" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: "Identifiants incorrects" });
    }

    await User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } });

    await Action.create({
      userId: user._id,
      action: 'USER_LOGIN',
      details: `Connexion réussie: ${username}`,
    });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "secret_key_123",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Connexion réussie",
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error("❌ Erreur connexion:", error);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
};


/**
 * ===============================
 * GET CURRENT USER
 * ===============================
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, error: "Utilisateur non trouvé" });

    res.json({ success: true, user });
  } catch (error) {
    console.error("❌ Erreur getMe:", error);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
};


/**
 * ===============================
 * LOGOUT
 * ===============================
 */
exports.logout = async (req, res) => {
  try {
    if (req.user) {
      await Action.create({
        userId: req.user.id,
        action: 'USER_LOGOUT',
        details: `Déconnexion: ${req.user.username}`,
      });
    }
    res.json({ success: true, message: "Déconnexion réussie" });
  } catch (error) {
    console.error("❌ Erreur logout:", error);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
};
