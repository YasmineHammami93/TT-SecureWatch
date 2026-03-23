# 📂 STRUCTURE COMPLÈTE DU BACKEND - RÉCAPITULATIF

## ✅ Fichiers créés

### 📁 Routes (6 fichiers)
- ✅ `routes/authRoutes.js` - Authentification (register, login, profile)
- ✅ `routes/alertRoutes.js` - Gestion des alertes (CRUD, assign, comments, analyze)
- ✅ `routes/userRoutes.js` - Gestion utilisateurs (ADMIN only)
- ✅ `routes/collectorRoutes.js` - Synchronisation SIEM
- ✅ `routes/statsRoutes.js` - Statistiques et KPIs
- ✅ `routes/playbookRoutes.js` - Playbooks SOC automatisés

### 📁 Controllers (4 fichiers)
- ✅ `controllers/authController.js` - Logique authentification
- ✅ `controllers/alertController.js` - Logique gestion alertes
- ✅ `controllers/userController.js` - Logique gestion utilisateurs
- ✅ `controllers/statsController.js` - Logique statistiques

### 📁 Services (3 fichiers)
- ✅ `services/mlService.js` - Service ML (prétraitement + analyse)
- ✅ `services/emailService.js` - Service d'envoi d'emails
- ✅ `services/monitoringService.js` - Surveillance automatique

### 📁 Models (3 fichiers)
- ✅ `models/User.js` - Modèle Utilisateur (avec hash password)
- ✅ `models/Alert.js` - Modèle Alerte (avec données ML)
- ✅ `models/Action.js` - Modèle Action (historique)

### 📁 Middleware (1 fichier)
- ✅ `middleware/auth.js` - Middleware JWT (authenticateToken, isAdmin, isAnalyst)

### 📁 Config (1 fichier)
- ✅ `config/database.js` - Configuration MongoDB

### 📁 Collectors (1 fichier)
- ✅ `collectors/siem_collectors.js` - Collecte SIEM (Wazuh, QRadar, Defender)

### 📁 Scripts (2 fichiers)
- ✅ `scripts/init-db.js` - Initialisation base de données
- ✅ `scripts/sync-scheduler.js` - Synchronisation planifiée

### 📁 Fichiers racine
- ✅ `server.js` - Point d'entrée principal (EXISTANT - non modifié)
- ✅ `package.json` - Dépendances npm (EXISTANT)
- ✅ `.env.example` - Template variables d'environnement
- ✅ `.gitignore` - Fichiers à ignorer
- ✅ `README.md` - Documentation complète

---

## 🏗️ Architecture du Backend

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (Frontend)                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    ROUTES (API Endpoints)                    │
│  • authRoutes      • alertRoutes     • userRoutes           │
│  • collectorRoutes • statsRoutes     • playbookRoutes       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   MIDDLEWARE (Auth JWT)                      │
│  • authenticateToken  • isAdmin  • isAnalyst                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CONTROLLERS (Logique)                     │
│  • authController    • alertController                       │
│  • userController    • statsController                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICES (Business Logic)                 │
│  • mlService (ML Analysis)                                   │
│  • emailService (Notifications)                              │
│  • monitoringService (Auto Surveillance)                     │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   MODELS (MongoDB)       │  │  COLLECTORS (SIEM)       │
│  • User                  │  │  • Wazuh                 │
│  • Alert                 │  │  • IBM QRadar            │
│  • Action                │  │  • Microsoft Defender    │
└──────────────────────────┘  └──────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flux de données

### 1️⃣ Collecte automatique (toutes les 2 minutes)
```
SIEM Sources → Collectors → MongoDB → ML Service → Email Notification
```

### 2️⃣ Analyse manuelle d'une alerte
```
Frontend → API /api/alerts/:id/analyze → ML Service → Update Alert → Email
```

### 3️⃣ Authentification
```
Frontend → POST /api/auth/login → Verify Password → Generate JWT → Return Token
```

---

## 📊 Couches du système

### COUCHE 1 : Collecte SIEM
- **Fichier** : `collectors/siem_collectors.js`
- **Fonction** : Collecte des alertes depuis Wazuh, QRadar, Defender
- **Stockage** : MongoDB (modèle Alert)

### COUCHE 2 : Prétraitement ML
- **Fichier** : `services/mlService.js` → `mapAlertToFeatures()`
- **Fonction** : Transformation des alertes en features pour le ML
- **Output** : Objet JSON avec features (duration, proto, service, etc.)

### COUCHE 3 : Analyse ML
- **Fichier** : `services/mlService.js` → `predictWithML()`
- **Fonction** : Appel API Python Flask pour prédiction Random Forest
- **Output** : Classification (Attaque/Normal) + Score de risque

### COUCHE 4 : Mise à jour et Actions
- **Fichier** : `services/monitoringService.js` → `processAlertWithML()`
- **Fonction** : Mise à jour de la sévérité + Notifications automatiques
- **Actions** : Email si risque Critique/Haute

---

## 🎯 Endpoints API complets

### Authentification
```
POST   /api/auth/register        - Inscription
POST   /api/auth/login           - Connexion
GET    /api/auth/me              - Profil utilisateur
PUT    /api/auth/profile         - Mise à jour profil
```

### Alertes
```
GET    /api/alerts               - Liste alertes (filtres: source, severity, status, search, dateFrom, dateTo)
GET    /api/alerts/assigned      - Alertes assignées à l'utilisateur
GET    /api/alerts/:id           - Détails d'une alerte
PUT    /api/alerts/:id           - Mettre à jour une alerte
DELETE /api/alerts/:id           - Supprimer une alerte
POST   /api/alerts/:id/assign    - Assigner une alerte
POST   /api/alerts/:id/comments  - Ajouter un commentaire
POST   /api/alerts/:id/analyze   - Analyser avec ML
```

### Utilisateurs (ADMIN)
```
GET    /api/users                - Liste utilisateurs
GET    /api/users/:id            - Détails utilisateur
POST   /api/users                - Créer un utilisateur
PUT    /api/users/:id            - Modifier un utilisateur
DELETE /api/users/:id            - Supprimer un utilisateur
PATCH  /api/users/:id/role       - Changer le rôle
```

### Collecteurs SIEM
```
POST   /api/collectors/sync              - Synchroniser toutes les sources
POST   /api/collectors/sync/:source      - Synchroniser une source (wazuh/qradar/defender)
GET    /api/collectors/status            - Statut des collecteurs
```

### Statistiques
```
GET    /api/stats                - Statistiques globales (MTTR, FP Rate, distributions)
GET    /api/stats/detailed       - Statistiques détaillées par période (24h/7d/30d)
```

### Playbooks
```
GET    /api/playbooks            - Liste des playbooks disponibles
POST   /api/playbooks/:id/execute - Exécuter un playbook
GET    /api/playbooks/history    - Historique d'exécution
```

---

## 🚀 Commandes de démarrage

### Installation
```bash
cd backend
npm install
```

### Configuration
```bash
# Copier le template
cp .env.example .env

# Éditer les variables
nano .env
```

### Initialisation
```bash
# Initialiser la base de données
npm run init-db
```

### Démarrage
```bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
```

### Scripts utiles
```bash
# Synchronisation manuelle
npm run sync

# Initialisation DB
npm run init-db
```

---

## 🔐 Utilisateurs par défaut

Après `npm run init-db` :

| Username | Password | Role | Email |
|----------|----------|------|-------|
| admin | admin123 | ADMIN | admin@soc-tunisietelecom.tn |
| analyst | analyst123 | ANALYST | analyst@soc-tunisietelecom.tn |

⚠️ **Changez ces mots de passe en production !**

---

## 📧 Configuration Email

### Gmail (Développement)
1. Activer l'authentification à 2 facteurs
2. Générer un mot de passe d'application : https://myaccount.google.com/apppasswords
3. Utiliser dans `.env` :
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=mot-de-passe-application
```

---

## 🧪 Tests

### Test de connexion MongoDB
```bash
node -e "require('./config/database')().then(() => console.log('OK')).catch(e => console.error(e))"
```

### Test du service ML
```bash
curl http://127.0.0.1:5000/health
```

### Test de l'API
```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 📝 Logs et Monitoring

Les logs sont affichés avec des préfixes :
- `[AUTH]` - Authentification
- `[Alerts]` - Gestion des alertes
- `[ML Service]` - Service ML
- `[Monitoring]` - Surveillance automatique
- `[Email]` - Service email
- `[Collectors]` - Collecteurs SIEM
- `[Users]` - Gestion utilisateurs
- `[Stats]` - Statistiques
- `[Playbooks]` - Playbooks SOC

---

## 🎯 Prochaines étapes

1. ✅ Structure backend complète créée
2. ✅ Tous les controllers, services, routes implémentés
3. ✅ Scripts d'initialisation et de synchronisation
4. ✅ Documentation complète
5. 🔄 Tester l'intégration avec le frontend
6. 🔄 Déploiement en production

---

## 🐛 Dépannage

### MongoDB ne démarre pas
```bash
sudo systemctl status mongod
sudo systemctl restart mongod
```

### Service ML non disponible
```bash
cd ../ml
python app.py
```

### Port déjà utilisé
```bash
# Changer dans .env
PORT=3002
```

### Erreur JWT
```bash
# Vérifier JWT_SECRET dans .env
# Régénérer un token en se reconnectant
```

---

**🎉 Backend SOC complet et opérationnel !**

Développé par l'équipe SOC Tunisie Telecom 🇹🇳
