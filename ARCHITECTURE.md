
# Architecture du Système "Cyber Alert Platform"

Ce document détaille l'architecture technique de la plateforme que vous avez développée, en incluant **tous les fichiers sources**. Vous pouvez l'utiliser pour la section **2.5 Architecture du Système** de votre rapport.

---

## 2.5 Architecture du Système

L'application suit une **Architecture Modulaire Monolithique** avec une séparation claire entre le Frontend, le Backend et le Moteur d'Intelligence Artificielle.

### 2.5.1 Vue d'Ensemble

L'architecture repose sur 4 piliers principaux :
1.  **Client Layer (Frontend)** : Interface utilisateur responsive (SPA).
2.  **API Server (Backend)** : Gestionnaire des requêtes et de la sécurité via API REST.
3.  **Intelligence Layer (ML Engine)** : Analyse prédictive des alertes.
4.  **Data Layer (Persistence)** : Stockage des données structurées.

---

### 2.5.2 Architecture Logique en 5 Couches (5-Layer Architecture)

Notre implémentation respecte strictement le modèle en couches pour garantir la maintenabilité et l'évolutivité.

#### **Couche 1 : Présentation (Frontend)**
*   **Technologie :** React.js 19, TypeScript, Tailwind CSS.
*   **Chemin :** `frontend/src/`
*   **Fichiers Principaux :**
    *   `App.tsx` : Composant racine et définition des routes.
    *   `index.tsx` : Point d'entrée de l'application React.
    *   `backendService.tsx`: Service pour les appels API vers le Backend.
*   **Pages (`frontend/src/pages/`) :**
    *   `Login.tsx` : Page d'authentification.
    *   `Dashboard.tsx` : Vue principale avec statistiques et graphiques.
    *   `AlertList.tsx` : Liste complète des alertes avec filtrage.
    *   `AlertDetail.tsx` : Vue détaillée d'une alerte spécifique.
    *   `Landing.tsx` : Page d'accueil publique.
    *   `Assets.tsx` : Gestion des actifs.
    *   `Notifications.tsx` : Centre de notifications.
    *   `Reports.tsx` : Génération des rapports.
    *   `Settings.tsx` : Paramètres de l'application.
*   **Composants (`frontend/src/components/`) :**
    *   `Layout.tsx` : Structure de base (Header, Main Content).
    *   `Sidebar.tsx` : Barre de navigation latérale.
    *   `SeverityBadge.tsx` : Badge coloré pour indiquer la criticité.
    *   `ProtectedRoute.tsx` : HOC pour sécuriser les routes privées.
    *   `PlaybookExecutor.tsx` : Interface d'exécution des playbooks SOC.
*   **Contextes & Services (`frontend/src/contexts/` & `services/`) :**
    *   `AuthContext.tsx` : Gestion de l'état de connexion utilisateur.
    *   `ThemeContext.tsx` : Gestion du thème (Dark/Light mode).
    *   `backendService.tsx` : Service principal API.
    *   `geminiService.tsx` : Service IA générative (optionnel).
    *   `mockDb.tsx` : Données de test frontend.

#### **Couche 2 : Application / API (Backend Entry Point)**
*   **Technologie :** Node.js (Express.js).
*   **Chemin :** `backend/`
*   **Fichiers Principaux :**
    *   `server.js` : Serveur Express, Configuration CORS, Connexion DB, Routes API.
    *   `collectors/siem_collectors.js` : Module de simulation et collecte de logs SIEM.

#### **Couche 3 : Services & Logique Métier (Business Logic)**
*   **Technologie :** JavaScript (Node) & Python.
*   **Rôle :** Traitement des données et intelligence.
*   **Fichiers Backend (`backend/`) :**
    *   `emailService.js` : Service d'envoi d'emails (Nodemailer).
    *   `ml_service.py` : Script d'interface pour l'inférence ML (appelé par Node).
    *   `init_db.js` : Script d'initialisation de la base de données.
    *   `reset_db.js` : Script de réinitialisation de la base de données.
*   **Fichiers ML (`ml/`) :**
    *   `train_model.py` : Script d'entraînement du modèle Random Forest.
    *   `predict_alert.py` : Script de prédiction temps réel (utilisé en prod).
    *   `api.py` : API Flask pour le modèle (alternative microservice).
    *   `inspect_dataset.py` : Utilitaire d'analyse des données.
    *   `rf_ton_iot.pkl` : Modèle entraîné sérialisé (Pickle).
    *   `label_encoder.pkl` : Encodeurs pour les variables catégorielles.

#### **Couche 4 : Accès aux Données (Data Access Layer)**
*   **Technologie :** Mongoose (ODM).
*   **Chemin :** `backend/models/`
*   **Fichiers :**
    *   `Alert.js` : Schéma Mongoose pour les alertes de sécurité.
    *   `User.js` : Schéma Mongoose pour les utilisateurs et l'auth.

#### **Couche 5 : Persistance (Database)**
*   **Technologie :** MongoDB.
*   **Collections :**
    *   `alerts` : Historique complet des incidents.
    *   `users` : Comptes des analystes et administrateurs.

---

### 2.5.3 Flux de Données Technique (Data Flow)

1.  **Ingestion** : Une alerte brute arrive (via `siem_collectors.js` ou API).
2.  **Traitement** : `server.js` reçoit l'alerte et délègue l'analyse.
3.  **Intelligence** : `predict_alert.py` analyse les features via `rf_ton_iot.pkl`.
4.  **Décision** :
    *   Si *Score > 80* : Appel à `emailService.js`.
5.  **Stockage** : Sauvegarde via `Alert.js` dans MongoDB.
6.  **Visualisation** : `Dashboard.tsx` affiche les données via `backendService.tsx`.

---

### 2.5.4 Stack Technologique (Résumé)

| Composant | Technologie | Version |
| :--- | :--- | :--- |
| **Frontend** | React / TypeScript | v19 / v5 |
| **Styling** | Tailwind CSS | v3.4 |
| **Backend** | Node.js / Express | v20 / v4 |
| **Database** | MongoDB | v7.0 |
| **Machine Learning** | Python / Scikit-learn | v3.12 / v1.3 |
| **Visualisation** | Recharts | v2.10 |
