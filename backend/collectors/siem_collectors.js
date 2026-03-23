/**
 * Module des Collecteurs SIEM (Security Information and Event Management)
 * Ce module sert d'interface unifiée pour récupérer les alertes de différentes sources.
 * Il simule la connexion aux APIs de Wazuh, QRadar et Microsoft Defender.
 */

const Alert = require('../models/Alert'); // Importation du modèle Mongoose 'Alert' pour interagir avec la base de données MongoDB

class SIEMCollectors {
    /**
     * Méthode statique pour récupérer les alertes depuis Wazuh.
     * Dans un cas réel, cette méthode ferait un appel HTTP (axios.get) vers l'API Wazuh.
     */
    static async fetchWazuhAlerts() {
        console.log("[COLLECTOR] Fetching from Wazuh API..."); // Log pour indiquer le début de la récupération
        const alerts = []; // Initialisation du tableau qui contiendra les alertes récupérées

        // Liste des descriptions d'alertes possibles spécifiques à Wazuh (Hôte / Intégrité de fichiers)
        // Ces descriptions sont en français comme demandé.
        const descriptions = [
            'Échec de connexion sur le contrôleur de domaine (SRV-DC-01)', // Tentative de login échouée
            'Somme de contrôle d\'intégrité modifiée dans /etc/passwd',   // Modification critique d'un fichier système
            'Multiples tentatives de connexion échouées depuis une IP externe', // Brute force potentiel
            'Exécution suspecte de commande sudo détectée',               // Élévation de privilèges
            'Détection Rootkit : Processus caché identifié',              // Malware de type Rootkit
            'Modèle de Web Shell détecté dans les logs Apache'            // Backdoor Web
        ];

        // Boucle pour générer 15 alertes simulées
        for (let i = 0; i < 15; i++) {
            alerts.push({
                // Génération d'un ID unique commençant par 'WAZ-' suivit d'une chaîne aléatoire
                id: 'WAZ-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                source: 'Wazuh', // La source est fixée à 'Wazuh'
                // La sévérité est déterminée mathématiquement pour varier (Critique, Haute, Moyenne)
                severity: i % 5 === 0 ? 'CRITIQUE' : i % 3 === 0 ? 'HAUTE' : 'MOYENNE',
                // Sélection aléatoire d'une description parmi la liste ci-dessus
                description: descriptions[Math.floor(Math.random() * descriptions.length)],
                // Génération d'une IP source aléatoire dans le sous-réseau 10.0.0.x
                sourceIp: `10.0.0.${Math.floor(Math.random() * 254) + 1}`
            });
        }
        return alerts; // Retourne la liste des alertes générées
    }

    /**
     * Méthode statique pour récupérer les alertes depuis IBM QRadar.
     * Simule la détection d'anomalies réseau et de flux.
     */
    static async fetchQRadarAlerts() {
        console.log("[COLLECTOR] Fetching from QRadar API..."); // Log console
        const alerts = []; // Tableau vide pour les résultats

        // Descriptions spécifiques à l'analyse réseau (QRadar)
        const descriptions = [
            'Exfiltration de données possible via tunnel DNS',            // Fuite de données via protocole DNS
            'Scan de réseau interne détecté',                             // Reconnaissance réseau
            'Volume de trafic anormal vers un serveur C2 connu',          // Communication Command & Control
            'Tunnel SSH détecté sur un port non standard',                // Evasion de sécurité
            'Mouvement latéral : Création de service à distance (psexec)', // Propagation de l'attaque
            'Transfert sortant volumineux vers un stockage cloud'         // Exfiltration de données
        ];

        // Génération de 15 alertes simulées pour QRadar
        for (let i = 0; i < 15; i++) {
            alerts.push({
                id: 'QR-' + Math.random().toString(36).substr(2, 9).toUpperCase(), // ID unique QR-XXXXXXXX
                source: 'IBM QRadar', // Source identifiée
                severity: i % 4 === 0 ? 'CRITIQUE' : 'HAUTE', // Sévérité (plus souvent haute pour QRadar ici)
                description: descriptions[Math.floor(Math.random() * descriptions.length)], // Description aléatoire
                sourceIp: `172.16.5.${Math.floor(Math.random() * 254) + 1}` // IP source simulée (réseau 172.16.x.x)
            });
        }
        return alerts; // Retourne les alertes
    }

    /**
     * Méthode statique pour récupérer les alertes depuis Microsoft Defender.
     * Simule la protection des terminaux (Endpoint Protection).
     */
    static async fetchDefenderAlerts() {
        console.log("[COLLECTOR] Fetching from Microsoft Defender API..."); // Log console
        const alerts = []; // Tableau vide

        // Descriptions spécifiques aux menaces sur les postes de travail (Defender)
        const descriptions = [
            'Exécution PowerShell suspecte (Commande encodée)',           // Script malveillant obfusqué
            'Détection de malware : Win32/CobaltStrike.C',                // Signature de virus connue
            'Persistance : Tâche planifiée créée par un utilisateur inconnu', // Mécanisme de persistance
            'Injection de processus détectée dans lsass.exe',             // Attaque sur les identifiants
            'Tentative de vol d\'identifiants (Pattern Mimikatz)',        // Vol de mot de passe
            'Comportement de Ransomware : Chiffrement rapide de fichiers' // Activité de rançongiciel
        ];

        // Génération de 15 alertes simulées pour Defender
        for (let i = 0; i < 15; i++) {
            alerts.push({
                id: 'DEF-' + Math.random().toString(36).substr(2, 9).toUpperCase(), // ID unique DEF-XXXXXXXX
                source: 'Microsoft Defender', // Source
                severity: i % 2 === 0 ? 'CRITIQUE' : 'HAUTE', // Sévérité critique une fois sur deux
                description: descriptions[Math.floor(Math.random() * descriptions.length)], // Description aléatoire
                sourceIp: `192.168.1.${Math.floor(Math.random() * 254) + 1}` // IP locale classique
            });
        }
        return alerts; // Retourne les alertes
    }

    /**
     * Méthode principale 'syncAll' : Orchestre la récupération de TOUTES les sources.
     * C'est cette fonction qui est appelée par l'API /api/collectors/sync.
     */
    static async syncAll() {
        // Appels parallèles (en séquence ici avec await, mais pourraient être Promise.all) aux 3 collecteurs
        const wazuh = await this.fetchWazuhAlerts();     // Récupère Wazuh
        const qradar = await this.fetchQRadarAlerts();   // Récupère QRadar
        const defender = await this.fetchDefenderAlerts(); // Récupère Defender

        // Fusionne tous les tableaux d'alertes en un seul grand tableau
        const allNewAlerts = [...wazuh, ...qradar, ...defender];
        const syncedAlerts = []; // Tableau pour stocker les alertes VRAIMENT nouvelles (pas encore en BD)

        // Boucle sur chaque alerte récupérée pour la sauvegarder si elle n'existe pas déjà
        for (const rawAlert of allNewAlerts) {
            // Vérifie si une alerte avec cet ID existe déjà dans MongoDB
            const exists = await Alert.findOne({ id: rawAlert.id });

            if (!exists) {
                // Si elle n'existe pas, on crée une nouvelle instance du modèle Alert
                const alert = new Alert({
                    ...rawAlert,          // On copie toutes les propriétés (source, severity, description, etc.)
                    timestamp: new Date(), // On ajoute l'heure actuelle de l'ingestion
                    status: 'NOUVEAU'      // On initialise le statut à 'NOUVEAU'
                });

                await alert.save(); // On sauvegarde dans MongoDB
                syncedAlerts.push(alert); // On l'ajoute à la liste des succès
                console.log(`[COLLECTOR] Alerte synchronisée: ${alert.id}`); // Log de succès
            }
        }
        return syncedAlerts; // Renvoie uniquement les NOUVELLES alertes insérées
    }
}

module.exports = SIEMCollectors; // Exporte la classe pour qu'elle soit utilisable dans server.js

