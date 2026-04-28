const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const DATASET_PATH = path.join(__dirname, '../../dataset/Train_Test_Network.csv');

/**
 * Service to handle real data from the ToN-IoT dataset.
 */
class DatasetService {
    /**
     * Reads a random set of rows from the dataset.
     * Uses a stream-based approach for memory efficiency.
     * @param {number} count Number of rows to retrieve.
     * @returns {Promise<Array>} List of real network records.
     */
    static async getRandomRows(count = 5) {
        return new Promise((resolve, reject) => {
            const results = [];
            const rowsBuffer = [];
            
            // To get random rows without loading the whole 30MB file,
            // we'll read a random subset by skipping a random number of rows.
            // Estimate of total rows: ~200,000 for 30MB
            const approximateTotalRows = 200000;
            const startOffset = Math.floor(Math.random() * (approximateTotalRows - 500)); 

            let rowsProcessed = 0;
            let rowsCollected = 0;

            fs.createReadStream(DATASET_PATH)
                .pipe(csv())
                .on('data', (data) => {
                    rowsProcessed++;
                    
                    // Start collecting after the random offset
                    if (rowsProcessed >= startOffset && rowsCollected < count) {
                        results.push(data);
                        rowsCollected++;
                    }
                    
                    // Optimization: Once we have enough, we could potentially stop the stream,
                    // but for 30MB, finishing the pipe or just letting it run briefly is fine.
                    // To actually stop a stream, we'd need to handle destruction.
                })
                .on('end', () => {
                    resolve(results);
                })
                .on('error', (error) => {
                    reject(error);
                });
        });
    }

    /**
     * Map a dataset row to the platform's Alert model structure.
     */
    static mapRowToAlert(row) {
        // Map types to sources (Hybrid approach)
        let source = 'Wazuh';
        const type = (row.type || 'normal').toLowerCase();
        
        if (['ddos', 'dos', 'scanning'].includes(type)) {
            source = 'IBM QRadar';
        } else if (['malware', 'backdoor', 'ransomware', 'mitm', 'injection', 'xss'].includes(type)) {
            source = 'Microsoft Defender';
        } else if (['password'].includes(type)) {
            source = 'Wazuh';
        } else {
            // Fallback pour les types non-reconnus ou 'normal'
            const sourcesList = ['Wazuh', 'IBM QRadar', 'Microsoft Defender'];
            source = sourcesList[Math.floor(Math.random() * sourcesList.length)];
        }

        // Determine severity based on type or label
        let severity = 'MOYENNE';
        if (row.label == '1') {
            if (['ddos', 'ransomware', 'backdoor', 'injection'].includes(type)) {
                severity = 'CRITIQUE';
            } else {
                severity = 'HAUTE';
            }
        } else {
            severity = 'INFO';
        }

        // --- IMPORTANT: Cast numeric fields to Number! ---
        // csv-parser returns everything as strings. The ML model needs numbers.
        const numericFields = [
            'src_port', 'dst_port', 'dur', 'spkts', 'dpkts', 'sbytes', 'dbytes', 
            'rate', 'sttl', 'dttl', 'sload', 'dload', 'sloss', 'dloss', 
            'sinpkt', 'dinpkt', 'sjit', 'djit', 'swft', 'dwft', 'tcprtt', 
            'synack', 'ackdat', 'smean', 'dmean', 'trans_depth', 'res_bdy_len', 'label'
        ];

        const technicalData = { ...row };
        numericFields.forEach(field => {
            if (technicalData[field] !== undefined) {
                technicalData[field] = Number(technicalData[field]);
            }
        });

        const descriptionsWazuh = [
            'Échec de connexion sur le contrôleur de domaine (SRV-DC-01)',
            'Somme de contrôle d\'intégrité modifiée dans /etc/passwd',
            'Multiples tentatives de connexion échouées depuis une IP externe',
            'Exécution suspecte de commande sudo détectée',
            'Détection Rootkit : Processus caché identifié',
            'Modèle de Web Shell détecté dans les logs Apache'
        ];

        const descriptionsQRadar = [
            'Exfiltration de données possible via tunnel DNS',
            'Scan de réseau interne détecté',
            'Volume de trafic anormal vers un serveur C2 connu',
            'Tunnel SSH détecté sur un port non standard',
            'Mouvement latéral : Création de service à distance (psexec)',
            'Transfert sortant volumineux vers un stockage cloud'
        ];

        const descriptionsDefender = [
            'Exécution PowerShell suspecte (Commande encodée)',
            'Détection de malware : Win32/CobaltStrike.C',
            'Persistance : Tâche planifiée créée par un utilisateur inconnu',
            'Injection de processus détectée dans lsass.exe',
            'Tentative de vol d\'identifiants (Pattern Mimikatz)',
            'Comportement de Ransomware : Chiffrement rapide de fichiers'
        ];

        const descriptionsBenign = [
            'Volume réseau élevé (Mise à jour Windows Update locale)',
            'Connexion RDP autorisée par Administrateur',
            'Synchronisation de base de données (Trafic SQL standard)',
            'Transfert de fichier interne (Sauvegarde de nuit)',
            'Trafic DNS volumineux (Résolution d\'hôtes internes)',
            'Requêtes HTTP multiples (Vérification de santé du Load Balancer)'
        ];

        let finalDescription = '';
        if (row.label == '0') {
            finalDescription = descriptionsBenign[Math.floor(Math.random() * descriptionsBenign.length)];
        } else if (source === 'IBM QRadar') {
            finalDescription = descriptionsQRadar[Math.floor(Math.random() * descriptionsQRadar.length)];
        } else if (source === 'Microsoft Defender') {
            finalDescription = descriptionsDefender[Math.floor(Math.random() * descriptionsDefender.length)];
        } else {
            finalDescription = descriptionsWazuh[Math.floor(Math.random() * descriptionsWazuh.length)];
        }
        
        // On garde toujours l'IP réelle et autres infos techniques du dataset ToN-IoT.
        return {
            source: source,
            sourceIp: row.src_ip,
            destinationIp: row.dst_ip,
            severity: severity,
            description: finalDescription,
            affectedSystem: `Poste ${row.dst_ip}`,
            rawLog: JSON.stringify(row),
            technicalData: technicalData 
        };
    }
}

module.exports = DatasetService;
