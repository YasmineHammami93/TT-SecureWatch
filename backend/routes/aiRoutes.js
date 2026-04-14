const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { generateAnalysis } = require('../services/geminiService');
const Action = require('../models/Action');

/**
 * POST /api/ai/analyze
 * Lance une analyse contextuelle intelligente via Gemini
 */
router.post('/analyze', authenticateToken, async (req, res) => {
  try {
    const alertData = req.body;

    if (!alertData || !alertData.id) {
      return res.status(400).json({ error: "Données de l'alerte manquantes" });
    }

    console.log(`[AI SERVICE] 🤖 Analyse Gemini demandée pour l'alerte: ${alertData.id}`);

    // Appel au service Gemini
    const result = await generateAnalysis(alertData);

    // Enregistrement de l'action dans l'historique
    await Action.create({
      alertId: alertData.id,
      userId: req.user.id,
      action: 'AI_ANALYZE',
      details: `Analyse contextuelle Gemini : ${result.summary}`,
      timestamp: new Date()
    });

    res.json(result);

  } catch (error) {
    console.error("[AI ROUTES] ❌ Erreur analyse AI:", error);
    res.status(500).json({ error: "Erreur lors de l'analyse intelligente" });
  }
});

module.exports = router;
