const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Initialisation de Gemini avec la clé API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Service pour générer une analyse de sécurité intelligente via Gemini
 * @param {Object} alertData - Les données complètes de l'alerte
 * @returns {Promise<Object>} - L'analyse structurée
 */
const generateAnalysis = async (alertData) => {
  try {
    // Si pas de clé API, on simule une réponse intelligente basée sur les données réelles
    if (!process.env.GEMINI_API_KEY) {
      console.warn("[Gemini Service] ⚠️ Clé API absente. Mode simulation activé.");
      return getMockAnalysis(alertData);
    }

    const prompt = `
      Tu es un expert senior en cybersécurité au sein d'un SOC (Security Operations Center).
      Analyse l'alerte suivante en te basant sur le dataset ToN-IoT et fournis un diagnostic technique précis au format JSON.
      
      IMPORTANT : Ton score de risque (riskScore) et ton niveau (riskLevel) DOIVENT être cohérents avec la Sévérité actuelle définie dans le système.
      
      DONNÉES DE L'ALERTE :
      - Description : ${alertData.description}
      - Sévérité Actuelle : ${alertData.severity}
      - Source IP : ${alertData.sourceIp || 'N/A'}
      - Destination IP : ${alertData.destinationIp || 'N/A'}
      - Logs bruts : ${alertData.rawLog || 'N/A'}
      
      CONSIGNES POUR LE JSON :
      1. "summary": Résumé pro de l'attaque.
      2. "rootCause": Cause technique probable (liée au trafic IoT).
      3. "riskScore": Un score entre 0 et 100 (Doit être > 90 si Sévérité=CRITIQUE, > 75 si HAUTE).
      4. "riskLevel": Doit correspondre à la Sévérité Actuelle (${alertData.severity}).
      5. "remediationSteps": 4 étapes de résolution.
      6. "recommendedAction": Action immédiate.

      Réponds uniquement avec le JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Nettoyage du JSON au cas où Gemini ajouterait des balises markdown
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("[Gemini Service] ❌ Erreur analyse:", error);
    return getMockAnalysis(alertData);
  }
};

/**
 * Mode de secours (Mock) très réaliste si l'API échoue ou est absente
 */
const getMockAnalysis = (alert) => {
  const desc = (alert.description || "").toLowerCase();
  const severity = (alert.severity || "MOYENNE").toUpperCase();
  
  // Calcul d'un score de base selon la sévérité pour la cohérence
  let baseScore = 45;
  let level = "Moyen";

  if (severity === 'CRITIQUE') { baseScore = 92; level = "Critique"; }
  else if (severity === 'HAUTE') { baseScore = 78; level = "Élevé"; }
  else if (severity === 'FAIBLE') { baseScore = 15; level = "Faible"; }

  if (desc.includes('brute') || desc.includes('connexion') || desc.includes('password')) {
    return {
      summary: "Tentative d'accès non autorisé par force brute détectée.",
      rootCause: "Multiples échecs d'authentification sur un service exposé.",
      riskScore: baseScore,
      riskLevel: level,
      remediationSteps: [
        "Bloquer l'IP source sur le pare-feu périmétrique",
        "Désactiver temporairement le compte utilisateur visé",
        "Vérifier les journaux d'audit pour des accès réussis",
        "Activer l'authentification à deux facteurs (MFA)"
      ],
      recommendedAction: "Blocage immédiat de l'IP source et rotation des clés"
    };
  }

  if (desc.includes('ddos') || desc.includes('dos') || desc.includes('flood')) {
    return {
      summary: "Attaque par déni de service (DoS) identifiée.",
      rootCause: "Saturation des ressources réseau par un flux massif de paquets.",
      riskScore: Math.max(baseScore, 85),
      riskLevel: "Critique",
      remediationSteps: [
        "Activer le filtrage de trafic au niveau du FAI/WAF",
        "Limiter le taux de connexion (Rate Limiting)",
        "Dévier le trafic suspect via un service de scrubbing",
        "Vérifier la disponibilité des services critiques"
      ],
      recommendedAction: "Activation de la protection anti-DDoS"
    };
  }

  return {
    summary: `Détection d'une activité ${severity.toLowerCase()} nécessitant une investigation.`,
    rootCause: "Comportement suspect identifié par les capteurs de sécurité.",
    riskScore: baseScore,
    riskLevel: level,
    remediationSteps: [
      "Analyser le flux réseau détaillé",
      "Vérifier les processus actifs sur la machine cible",
      "Collecter les preuves forensiques (logs systèmes)",
      "Isoler le segment réseau si l'activité persiste"
    ],
    recommendedAction: "Investigation prioritaire par l'analyste SOC"
  };
};

module.exports = { generateAnalysis };
