# 🚀 BACKEND SOC - GUIDE DE DÉMARRAGE COMPLET

## 📋 Table des matières
1. [Prérequis](#prérequis)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Démarrage](#démarrage)
5. [Structure du projet](#structure-du-projet)
6. [API Endpoints](#api-endpoints)
7. [Scripts utiles](#scripts-utiles)

---

## 🔧 Prérequis

- **Node.js** v16+ et npm
- **MongoDB** v5+ (local ou Atlas)
- **Python** 3.8+ (pour le service ML)
- **Git**

---

## 📦 Installation

### 1. Cloner le projet
```bash
cd backend
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Créer le fichier `.env`
```bash
cp .env.example .env
```

Puis éditez `.env` avec vos valeurs :
```env
# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/soc_alerts_db

# JWT Secret (CHANGEZ CETTE VALEUR EN PRODUCTION)
JWT_SECRET=votre_secret_jwt_super_securise_changez_moi_123456

# Port serveur
PORT=3001

# ML Service (Python Flask)
ML_API_URL=http://127.0.0.1:5000

# Email (Nodemailer - Gmail exemple)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-application

# Admin par défaut
ADMIN_EMAIL=admin@soc-tunisietelecom.tn

# Environment
NODE_ENV=development

# Surveillance automatique (true/false)
ENABLE_AUTO_MONITORING=true
```

---

## ⚙️ Configuration

### 1. Démarrer MongoDB
```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
```

### 2. Initialiser la base de données
```bash
npm run init-db
```

Cela va créer :
- ✅ Utilisateur admin (username: `admin`, password: `admin123`)
- ✅ Utilisateur analyste de test (username: `analyst`, password: `analyst123`)

### 3. Démarrer le service ML (Python Flask)
```bash
cd ../ml
python app.py
```

Le service ML doit tourner sur `http://127.0.0.1:5000`

---

## 🚀 Démarrage

### Mode développement (avec auto-reload)
```bash
npm run dev
```

### Mode production
```bash
npm start
```

Le serveur démarre sur `http://localhost:3001`

---

## 📁 Structure du projet

```
backend/
│
├── 📄 server.js                    # Point d'entrée principal
├── 📄 .env                         # Variables d'environnement
├── 📄 package.json                 # Dépendances npm
│
├── 📁 config/
│   └── database.js                 # Configuration MongoDB
│
├── 📁 models/
│   ├── Alert.js                    # Modèle Alerte
│   ├── User.js                     # Modèle Utilisateur
│   └── Action.js                   # Modèle Action
│
├── 📁 middleware/
│   └── auth.js                     # Middleware JWT
│
├── 📁 collectors/
│   └── siem_collectors.js          # Collecte SIEM
│
├── 📁 services/
│   ├── mlService.js                # Service ML
│   ├── emailService.js             # Service Email
│   └── monitoringService.js        # Surveillance automatique
│
├── 📁 controllers/
│   ├── authController.js           # Logique authentification
│   ├── alertController.js          # Logique alertes
│   ├── userController.js           # Logique utilisateurs
│   └── statsController.js          # Logique statistiques
│
├── 📁 routes/
│   ├── authRoutes.js               # Routes /api/auth/*
│   ├── alertRoutes.js              # Routes /api/alerts/*
│   ├── userRoutes.js               # Routes /api/users/*
│   ├── collectorRoutes.js          # Routes /api/collectors/*
│   ├── statsRoutes.js              # Routes /api/stats/*
│   └── playbookRoutes.js           # Routes /api/playbooks/*
│
└── 📁 scripts/
    ├── init-db.js                  # Initialisation DB
    └── sync-scheduler.js           # Synchronisation planifiée
```

---

## 🌐 API Endpoints

### 🔐 Authentification (`/api/auth`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/auth/register` | Inscription | ❌ |
| POST | `/api/auth/login` | Connexion | ❌ |
| GET | `/api/auth/me` | Profil utilisateur | ✅ |
| PUT | `/api/auth/profile` | Mise à jour profil | ✅ |

### 🚨 Alertes (`/api/alerts`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/alerts` | Liste des alertes (avec filtres) | ✅ |
| GET | `/api/alerts/assigned` | Alertes assignées | ✅ |
| GET | `/api/alerts/:id` | Détails d'une alerte | ✅ |
| PUT | `/api/alerts/:id` | Mettre à jour une alerte | ✅ |
| DELETE | `/api/alerts/:id` | Supprimer une alerte | ✅ |
| POST | `/api/alerts/:id/assign` | Assigner une alerte | ✅ |
| POST | `/api/alerts/:id/comments` | Ajouter un commentaire | ✅ |
| POST | `/api/alerts/:id/analyze` | Analyser avec ML | ✅ |

### 👥 Utilisateurs (`/api/users`) - ADMIN ONLY

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/users` | Liste des utilisateurs | 🔒 ADMIN |
| GET | `/api/users/:id` | Détails utilisateur | 🔒 ADMIN |
| POST | `/api/users` | Créer un utilisateur | 🔒 ADMIN |
| PUT | `/api/users/:id` | Modifier un utilisateur | 🔒 ADMIN |
| DELETE | `/api/users/:id` | Supprimer un utilisateur | 🔒 ADMIN |
| PATCH | `/api/users/:id/role` | Changer le rôle | 🔒 ADMIN |

### 📡 Collecteurs SIEM (`/api/collectors`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/collectors/sync` | Synchroniser toutes les sources | ✅ |
| POST | `/api/collectors/sync/:source` | Synchroniser une source | ✅ |
| GET | `/api/collectors/status` | Statut des collecteurs | ✅ |

### 📊 Statistiques (`/api/stats`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/stats` | Statistiques globales | ✅ |
| GET | `/api/stats/detailed` | Statistiques détaillées | ✅ |

### 🎯 Playbooks (`/api/playbooks`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/playbooks` | Liste des playbooks | ✅ |
| POST | `/api/playbooks/:id/execute` | Exécuter un playbook | ✅ |
| GET | `/api/playbooks/history` | Historique d'exécution | ✅ |

---

## 🛠️ Scripts utiles

### Initialiser la base de données
```bash
npm run init-db
```

### Synchronisation manuelle
```bash
npm run sync
```

### Démarrage en développement
```bash
npm run dev
```

### Démarrage en production
```bash
npm start
```

---

## 🔍 Surveillance automatique

Le backend intègre un système de surveillance automatique qui :

1. **Synchronise les alertes SIEM** toutes les 2 minutes
2. **Analyse automatiquement** chaque nouvelle alerte avec le ML
3. **Envoie des notifications email** pour les alertes critiques/élevées
4. **Met à jour la sévérité** selon l'analyse ML

Pour désactiver la surveillance automatique :
```env
ENABLE_AUTO_MONITORING=false
```

---

## 📧 Configuration Email

### Gmail (recommandé pour le développement)

1. Activer l'authentification à 2 facteurs sur votre compte Gmail
2. Générer un mot de passe d'application : https://myaccount.google.com/apppasswords
3. Utiliser ce mot de passe dans `.env` :

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-application
```

### Autres services SMTP

Vous pouvez utiliser n'importe quel service SMTP (Outlook, SendGrid, etc.)

---

## 🐛 Dépannage

### MongoDB ne démarre pas
```bash
# Vérifier le statut
sudo systemctl status mongod

# Redémarrer
sudo systemctl restart mongod
```

### Service ML non disponible
```bash
# Vérifier que Flask tourne
curl http://127.0.0.1:5000/health

# Relancer le service
cd ../ml
python app.py
```

### Port 3001 déjà utilisé
```bash
# Changer le port dans .env
PORT=3002
```

---

## 📝 Logs

Les logs sont affichés dans la console avec des préfixes :
- `[AUTH]` - Authentification
- `[Alerts]` - Gestion des alertes
- `[ML Service]` - Service ML
- `[Monitoring]` - Surveillance automatique
- `[Email]` - Service email
- `[Collectors]` - Collecteurs SIEM

---

## 🔒 Sécurité

⚠️ **IMPORTANT EN PRODUCTION** :

1. Changez le `JWT_SECRET` dans `.env`
2. Changez le mot de passe admin par défaut
3. Utilisez HTTPS
4. Activez les limites de taux (rate limiting)
5. Validez toutes les entrées utilisateur
6. Utilisez des variables d'environnement sécurisées

---

## 📚 Documentation API complète

Pour tester l'API, vous pouvez utiliser :
- **Postman** : Importez la collection (à créer)
- **curl** : Exemples ci-dessous
- **Frontend** : Interface React intégrée

### Exemple de requête avec curl

```bash
# Connexion
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Récupérer les alertes (avec token)
curl -X GET http://localhost:3001/api/alerts \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

---

## 🎯 Prochaines étapes

1. ✅ Backend complet créé
2. ✅ Intégration ML fonctionnelle
3. ✅ Surveillance automatique active
4. 🔄 Connecter le frontend
5. 🔄 Déploiement en production

---

## 💡 Support

Pour toute question ou problème :
- 📧 Email : support@soc-tunisietelecom.tn
- 📖 Documentation : [Lien vers la doc]
- 🐛 Issues : [Lien vers GitHub Issues]

---

**Développé par l'équipe SOC Tunisie Telecom** 🇹🇳
