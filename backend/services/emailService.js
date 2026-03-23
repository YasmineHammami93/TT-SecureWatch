const nodemailer = require('nodemailer');
require('dotenv').config();

// Variable pour stocker le transporteur (initialisé dynamiquement)
let transporter = null;

/**
 * Initialise le service d'email avec Ethereal (Service de test gratuit)
 * Cela crée un compte volatile automatiquement, sans inscription nécessaire.
 */
const initEmailService = async () => {
    if (transporter) return;

    try {
        console.log('[EMAIL] Initialisation du service de test Ethereal...');
        // Création automatique d'un compte de test
        const testAccount = await nodemailer.createTestAccount();

        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // utilisateur généré
                pass: testAccount.pass, // mot de passe généré
            },
        });

        console.log('[EMAIL] Service Ethereal prêt !');
        console.log(`[EMAIL] Compte temporaire: ${testAccount.user}`);
    } catch (err) {
        console.error('[EMAIL] Erreur lors de la création du compte de test:', err);
    }
};

/**
 * Envoie un email d'alerte de sécurité
 * @param {string} to - Adresse email du destinataire
 * @param {object} alert - L'objet alerte contenant les détails
 */
const sendAlertEmail = async (to, alert) => {
    // S'assurer que le transporteur est initialisé
    if (!transporter) await initEmailService();

    if (!transporter) {
        console.error('[EMAIL] Impossible d\'envoyer l\'email : service non initialisé.');
        return false;
    }

    try {
        const mailOptions = {
            from: `"TTSecureWatch SOC" <soc@tunisietelecom.tn>`, // Expéditeur fictif (mais propre)
            to: to,
            subject: `ALERTE SOC : ${alert.predictedClass || alert.description}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; margin: auto; background-color: #f8fafc;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #0f172a; margin: 0;">Rapport d'Analyse de Sécurité</h2>
                        <p style="color: #64748b; font-size: 14px;">Généré par TTSecureWatch AI</p>
                    </div>
                    
                    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border-left: 5px solid ${alert.riskScore > 80 ? '#ef4444' : '#f97316'}; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <h3 style="color: #1e293b; margin-top: 0;">Description de l'Attaque</h3>
                        <p style="font-size: 18px; font-weight: bold; color: #0f172a; margin: 10px 0;">
                            ${alert.predictedClass || alert.description}
                        </p>
                        ${alert.riskScore ? `<p style="font-size: 14px; color: #ef4444;"><strong>Score de Risque IA :</strong> ${alert.riskScore}/100</p>` : ''}
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                        <div style="padding: 10px; background: #fff; border-radius: 6px; border: 1px solid #f1f5f9;">
                            <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase;">Source IP</p>
                            <p style="margin: 3px 0 0 0; font-weight: 600; color: #334155;">${alert.sourceIp}</p>
                        </div>
                        <div style="padding: 10px; background: #fff; border-radius: 6px; border: 1px solid #f1f5f9;">
                            <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase;">Sévérité</p>
                            <p style="margin: 3px 0 0 0; font-weight: 600; color: ${alert.severity === 'CRITIQUE' ? '#ef4444' : '#f59e0b'};">${alert.severity}</p>
                        </div>
                    </div>

                    <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0; margin-bottom: 20px;">
                        <h4 style="color: #166534; margin: 0 0 8px 0;">Recommandation AI:</h4>
                        <p style="color: #15803d; margin: 0; font-size: 14px;">${alert.recommendation || 'Analyse approfondie requise.'}</p>
                    </div>

                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />
                    <p style="font-size: 11px; color: #94a3b8; text-align: center;">
                        Ceci est une notification prioritaire du système SOC TTSecureWatch. 
                        Ne pas répondre à cet email.
                    </p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('---------------------------------------------------');
        console.log('[EMAIL] ✅ Email envoyé avec succès !');
        console.log('[EMAIL] 🔗 LIEN DE PRÉVISUALISATION (Cliquez ici) :');
        console.log(nodemailer.getTestMessageUrl(info));
        console.log('---------------------------------------------------');

        return true;
    } catch (error) {
        console.error('[EMAIL] Erreur lors de l\'envoi:', error);
        return false;
    }
};

module.exports = {
    sendAlertEmail,
};
