const jwt = require('jsonwebtoken');

// Middleware pour authentifier le token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ error: "Accès refusé. Token manquant." });
    }

    // Vérification de la signature du token
    jwt.verify(token, process.env.JWT_SECRET || 'secret_key_123', (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Token invalide ou expiré." });
        }
        req.user = user; // Stockage des infos utilisateur dans la requête
        next(); // Passage à la route suivante
    });
};

// Middleware pour vérifier si l'utilisateur est ADMIN
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ error: "Accès réservé aux administrateurs." });
    }
};

// Middleware pour vérifier si l'utilisateur est ANALYSTE ou ADMIN
const isAnalyst = (req, res, next) => {
    if (req.user && (req.user.role === 'ANALYSTE' || req.user.role === 'ADMIN')) {
        next();
    } else {
        res.status(403).json({ error: "Accès réservé aux analystes et administrateurs." });
    }
};

module.exports = {
    authenticateToken,
    isAdmin,
    isAnalyst
};
