
# Structure de Fichiers du Projet "Cyber Alert Platform"

Voici l'arborescence complète de votre projet, prête à être incluse dans les annexes ou la partie technique de votre rapport.

```plaintext
cyber-alert-platform/
│
├── backend/                        # Serveur API (Node.js)
│   ├── collectors/                 # Modules de collecte de données
│   │   └── siem_collectors.js      # Simulation de logs SIEM
│   ├── models/                     # Modèles de données (Mongoose)
│   │   ├── Alert.js                # Schéma des alertes
│   │   └── User.js                 # Schéma des utilisateurs
│   ├── node_modules/               # Dépendances Backend (exclus du rapport)
│   ├── .env                        # Variables d'environnement (Port, DB URI)
│   ├── emailService.js             # Service d'envoi d'emails (Nodemailer)
│   ├── init_db.js                  # Script d'initialisation de la BDD
│   ├── ml_service.py               # Interface Python pour le ML (appelé par Node)
│   ├── package.json                # Dépendances et scripts NPM
│   ├── reset_db.js                 # Script de nettoyage de la BDD
│   └── server.js                   # Point d'entrée principal (Express App)
│
├── frontend/                       # Application Client (React.js)
│   ├── public/                     # Fichiers statiques
│   ├── src/                        # Code source React
│   │   ├── components/             # Composants réutilisables
│   │   │   ├── Layout.tsx          # Structure de page (Header/Sidebar)
│   │   │   ├── PlaybookExecutor.tsx# Exécution des réponses automatiques
│   │   │   ├── ProtectedRoute.tsx  # Protection des routes privées
│   │   │   ├── SeverityBadge.tsx   # Badge de niveau de risque
│   │   │   └── Sidebar.tsx         # Menu de navigation
│   │   ├── contexts/               # Gestion d'état global
│   │   │   ├── AuthContext.tsx     # Authentification utilisateur
│   │   │   └── ThemeContext.tsx    # Thème sombre/clair
│   │   ├── pages/                  # Vues principales
│   │   │   ├── AlertDetail.tsx     # Détail d'une alerte
│   │   │   ├── AlertList.tsx       # Tableau des alertes
│   │   │   ├── Assets.tsx          # Gestion des actifs
│   │   │   ├── Dashboard.tsx       # Tableau de bord (Graphiques)
│   │   │   ├── Landing.tsx         # Page d'accueil
│   │   │   ├── Login.tsx           # Page de connexion
│   │   │   ├── Notifications.tsx   # Centre de notifications
│   │   │   ├── Reports.tsx         # Rapports PDF
│   │   │   └── Settings.tsx        # Configuration
│   │   ├── services/               # Services API
│   │   │   ├── backendService.tsx  # Communication avec le Backend
│   │   │   ├── geminiService.tsx   # Service IA (si utilisé)
│   │   │   └── mockDb.tsx          # Données de test frontend
│   │   ├── App.tsx                 # Racine de l'application
│   │   ├── App.css                 # Styles globaux
│   │   ├── index.css               # Styles Tailwind CSS
│   │   ├── index.tsx               # Point d'entrée React
│   │   └── types.ts                # Définitions des Types TypeScript
│   ├── package.json                # Dépendances Frontend
│   ├── tailwind.config.js          # Configuration CSS
│   └── tsconfig.json               # Configuration TypeScript
│
├── ml/                             # Moteur d'Intelligence Artificielle (Python)
│   ├── dataset/                    # Données d'entraînement
│   ├── api.py                      # API Flask (Alternative microservice)
│   ├── inspect_dataset.py          # Analyse exploratoire des données
│   ├── label_encoder.pkl           # Encodeur de labels (Pickle)
│   ├── model_columns.pkl           # Colonnes du modèle (Pickle)
│   ├── predict_alert.py            # Script de prédiction temps réel
│   ├── rf_ton_iot.pkl              # Modèle Random Forest entraîné
│   └── train_model.py              # Script d'entraînement du modèle
│
├── ARCHITECTURE.md                 # Documentation technique
├── PLAN_PFE.md                     # Plan du rapport (Généré)
└── README.md                       # Documentation du projet
```
