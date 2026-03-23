const axios = require('axios');
const Alert = require('../models/Alert');
const User = require('../models/User');
const { sendAlertEmail } = require('./emailService');

// Mapping des alertes vers les features ML
const mapAlertToFeatures = (alert) => {
    const desc = alert.description ? alert.description.toLowerCase() : '';
    const proto = (desc.includes('udp') || desc.includes('dns')) ? 'udp' : 'tcp';
    const service = (desc.includes('dns')) ? 'dns' : ((desc.includes('http') || desc.includes('web')) ? 'http' : 'other');

    // Variabilité des stats réseau selon le type d'attaque
    let src_pkts = Math.floor(Math.random() * 50) + 1;
    let dst_pkts = Math.floor(Math.random() * 50) + 1;

    if (desc.includes('ddos') || desc.includes('flood')) {
        src_pkts = Math.floor(Math.random() * 5000) + 1000;
        dst_pkts = Math.floor(Math.random() * 50);
    } else if (desc.includes('scan')) {
        src_pkts = Math.floor(Math.random() * 200) + 50;
        dst_pkts = Math.floor(Math.random() * 10);
    } else if (desc.includes('brute') || desc.includes('ssh')) {
        src_pkts = Math.floor(Math.random() * 100) + 20;
        dst_pkts = Math.floor(Math.random() * 100) + 20;
    } else if (desc.includes('http') || desc.includes('web')) {
        src_pkts = Math.floor(Math.random() * 50) + 50;
        dst_pkts = Math.floor(Math.random() * 500) + 500;
    }

    return {
        duration: Math.random() * 10,
        proto: proto,
        service: service,
        conn_state: 'SF',
        src_pkts: src_pkts,
        dst_pkts: dst_pkts,
        src_bytes: Math.floor(Math.random() * 2000) + 100,
        dst_bytes: Math.floor(Math.random() * 2000) + 100
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
                mlData: {
                    predictedClass: predictedClassStr,
                    confidenceScore: mlResult.confidence,
                    riskScore: mlResult.risk_score,
                    riskLevel: mlResult.risk_level,
                    isAutomated: isAutomated
                }
            }
        );

        // Notification automatique si risque critique ou élevé
        if (mlResult.risk_level === 'Critique' || mlResult.risk_level === 'Haute') {
            let recipient = 'yasminehammami97@gmail.com';

            if (user) {
                const userData = await User.findById(user.id);
                recipient = userData?.settings?.contactEmail || userData?.email || recipient;
            } else {
                const admin = await User.findOne({ role: 'ADMIN' });
                recipient = admin?.settings?.contactEmail || admin?.email || recipient;
            }

            await sendAlertEmail(recipient, {
                ...alert,
                predictedClass: predictedClassStr,
                riskScore: Math.round(mlResult.confidence * 100),
                recommendation: isAutomated ? "BLOCAGE AUTOMATIQUE" : "INVESTIGATION PRIORITAIRE"
            });

            console.log(`[ML Service] Notification envoyée pour ${alert.id} (${mlResult.risk_level})`);
        }

        return {
            summary: `Classification ML: ${predictedClassStr}`,
            riskScore: mlResult.risk_score,
            confidence: mlResult.confidence,
            riskLevel: mlResult.risk_level,
            recommendedAction: isAutomated ? "Actions de remédiation immédiates recommandées (Blocage)" : "Investigation manuelle requise",
            isAutomated: isAutomated,
            rootCause: "Déduite par Random Forest (API Python)",
            remediationSteps: isAutomated ? ["Blocage IP automatique", "Notification Admin"] : ["Vérifier les logs", "Isoler l'hôte"]
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
