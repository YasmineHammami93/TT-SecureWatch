const axios = require('axios');
const Alert = require('../models/Alert');
const User = require('../models/User');
const { sendAlertEmail } = require('./emailService');

// Mapping des alertes vers les features ML
const mapAlertToFeatures = (alert) => {
    // Si on a déjà des données techniques réelles (depuis le dataset), on les utilise
    if (alert.technicalData) {
        return alert.technicalData;
    }

    // Sinon, on garde la simulation pour les alertes manuelles/legacy
    const desc = alert.description ? alert.description.toLowerCase() : '';
    const proto = (desc.includes('udp') || desc.includes('dns')) ? 'udp' : 'tcp';
    const service = (desc.includes('dns')) ? 'dns' : ((desc.includes('http') || desc.includes('web')) ? 'http' : 'other');

    return {
        proto: proto,
        service: service,
        state: 'SF',
        dur: Math.random() * 2,
        spkts: Math.floor(Math.random() * 100),
        dpkts: Math.floor(Math.random() * 100),
        sbytes: Math.floor(Math.random() * 1000),
        dbytes: Math.floor(Math.random() * 1000),
        rate: Math.random() * 100,
        sload: Math.random() * 1000,
        dload: Math.random() * 1000
    };
};

// Prédiction ML via API Python
const predictWithML = async (features) => {
    try {
        const response = await axios.post('http://127.0.0.1:5000/predict', features, {
            timeout: 5000
        });
        return response.data;
    } catch (error) {
        console.error('[ML Service] Erreur connexion API Python:', error.message);
        return null;
    }
};

// Traitement complet d'une alerte avec ML
const processAlertWithML = async (alert, user = null) => {
    try {
        const features = mapAlertToFeatures(alert);

        // Appel à l'API ML
        const mlResult = await predictWithML(features);

        if (!mlResult || mlResult.error) {
            console.error(`[ML Service] Erreur ML: ${mlResult?.error || 'Service indisponible'}`);
            return null;
        }

        const isAutomated = mlResult.risk_level === 'Critique';
        const predictedClassStr = mlResult.prediction === 1 ? 'Attaque' : 'Normal';
        
        const newStatus = alert.status;

        // Mapping du niveau de risque vers la sévérité
        let newSeverity = alert.severity;
        if (mlResult.risk_level === 'Critique') newSeverity = 'CRITIQUE';
        else if (mlResult.risk_level === 'Haute') newSeverity = 'HAUTE';
        else if (mlResult.risk_level === 'Moyenne') newSeverity = 'MOYENNE';
        else if (mlResult.risk_level === 'Faible') newSeverity = 'FAIBLE';

        // Mise à jour de l'alerte en base
        await Alert.findOneAndUpdate(
            { id: alert.id },
            {
                severity: newSeverity,
                status: newStatus,
                mlData: {
                    predictedClass: predictedClassStr,
                    confidenceScore: mlResult.confidence,
                    riskScore: mlResult.risk_score,
                    riskLevel: mlResult.risk_level,
                    isAutomated: isAutomated
                }
            }
        );

        // Notification automatique supprimée (Passage en mode manuel via l'interface utilisateur ou le bouton 'Notifier SOC')
        if (mlResult.risk_level === 'Critique') {
            console.log(`[ML Service] Alerte CRITIQUE ${alert.id} détectée (Analyse terminée, aucune notification automatique envoyée)`);
        }

        // Dynamic text generation based on Prediction and Alert Context
        const isFalsePositive = mlResult.prediction === 0;
        const descLower = (alert.description || '').toLowerCase();
        
        // Valeurs par défaut pour une attaque générique
        let attackTypeStr = "anomalie système ou réseau";
        let rootCause = "Activité malveillante générique confirmée par Random Forest";
        let remediationSteps = isAutomated 
            ? ["Blocage IP automatique", "Notification Admin", "Isolation du Segment"] 
            : ["Analyser les logs systèmes", "Isoler l'hôte affecté", "Rechercher des mouvements latéraux"];

        // Spécialisation selon le contexte de l'alerte
        if (!isFalsePositive) {
            if (descLower.includes('ddos') || descLower.includes('dos') || descLower.includes('volume')) {
                attackTypeStr = "attaque de Déni de Service (DoS/DDoS)";
                rootCause = "Trafic anormalement élevé visant à saturer la cible (Score ML affirmé)";
                remediationSteps = isAutomated ? ["Blocage IP automatique", "Filtrage au niveau du Firewall/WAF"] : ["Activer la protection anti-DDoS", "Limiter le taux de requêtes (Rate Limiting)"];
            } else if (descLower.includes('ransomware') || descLower.includes('chiffrement') || descLower.includes('malware') || descLower.includes('cobaltstrike')) {
                attackTypeStr = "infection par Malware/Ransomware";
                rootCause = "Comportement de chiffrement ou présence de charge utile malveillante détectée";
                remediationSteps = ["Déconnexion immédiate du réseau (Isolation)", "Analyse forensique du disque", "Restauration depuis un backup sain"];
            } else if (descLower.includes('connexion') || descLower.includes('identifiants') || descLower.includes('scan') || descLower.includes('mouvement')) {
                attackTypeStr = "tentative de compromission ou de mouvement latéral";
                rootCause = "Tentatives d'accès non autorisées ou exploration du réseau interne";
                remediationSteps = isAutomated ? ["Blocage automatique de l'IP source", "Verrouillage du compte"] : ["Réinitialiser les mots de passe", "Bloquer les IPs suspectes sur le pare-feu"];
            } else if (descLower.includes('powershell') || descLower.includes('injection') || descLower.includes('commande') || descLower.includes('shell') || descLower.includes('rootkit')) {
                attackTypeStr = "exécution de code arbitraire / compromission système";
                rootCause = "Utilisation suspecte d'outils d'administration ou exécution de scripts encodés furtifs";
                remediationSteps = ["Isoler l'hôte affecté", "Tuer les processus suspects identifiés", "Analyser la chaîne d'exécution (EDR)"];
            } else if (descLower.includes('exfiltration') || descLower.includes('tunnel') || descLower.includes('sortie')) {
                attackTypeStr = "exfiltration de données / transfert Cloud";
                rootCause = "Connexion sortante massive ou utilisation de tunnel masqué indiquant une fuite de données";
                remediationSteps = ["Bloquer les ports ou protocoles non-standards", "Interdire temporairement le flux vers la destination", "Vérifier l'intégrité des données touchées"];
            }
        }

        let summary = `Classification ML: ${predictedClassStr}. Le modèle a analysé l'évènement et l'identifie comme ${isFalsePositive ? 'un trafic normal et légitime' : 'une ' + attackTypeStr + ' malveillante'}.`;

        if (isFalsePositive) {
            rootCause = "Comportement réseau bénin confondu avec une menace par la règle SIEM (False Positive)";
            remediationSteps = ["Ignorer l'alerte (Validé par Modèle ML)", "Ajuster la sensibilité de la règle de détection SIEM"];
        }

        let recommendedAction = isFalsePositive
            ? "Clôturer et archiver l'alerte"
            : (isAutomated ? "Blocage automatique conseillé/appliqué" : "Investigation approfondie requise pour confinement");

        return {
            summary,
            riskScore: mlResult.risk_score,
            confidence: mlResult.confidence,
            riskLevel: mlResult.risk_level,
            recommendedAction,
            isAutomated,
            rootCause,
            remediationSteps
        };
    } catch (error) {
        console.error('[ML Service] Erreur traitement:', error);
        return null;
    }
};

module.exports = {
    mapAlertToFeatures,
    predictWithML,
    processAlertWithML
};
