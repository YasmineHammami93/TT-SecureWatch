
# Plan Final du Rapport PFE (VERSION DÉFINITIVE)

**Sujet :** Conception d’un Système Intelligent de Gestion et d’Automatisation des Alertes de Cybersécurité

---

## 📄 Pages Préliminaires
*   Page de garde
*   Dédicace
*   Remerciements
*   Table des matières
*   Liste des figures
*   Liste des tableaux
*   Liste des abréviations

---

## 📝 Introduction Générale (2-3 pages)
*   **Contexte :** Augmentation des cyberattaques et volume d'alertes SIEM.
*   **Problématique :** Surcharge des SOC face aux faux positifs et alertes non critiques.
*   **Objectif :** Développer un système intelligent basé sur l'IA (Random Forest) pour classifier et automatiser la réponse.
*   **Méthodologie :** SCRUM avec 3 sprints (Collecte, Analyse ML, Automatisation).
*   **Structure du rapport.**

---

## 📖 CHAPITRE 1 : Étude Préalable et Spécification des Besoins (18-22 pages)
### 1.1 Introduction
### 1.2 Cadre du Projet
### 1.3 Présentation de l'Organisme d'Accueil
*   1.3.1 Présentation de Tunisie Telecom.
*   1.3.2 Direction de la Sécurité des Systèmes d'Information (DSSI).
*   1.3.3 Le SOC (Security Operations Center).
### 1.4 Présentation du Projet
*   Contexte général (cahier des charges point 1).
*   Problématique (cahier des charges point 2).
*   Objectifs du projet (cahier des charges point 3).
### 1.5 Étude de l'Existant
*   1.5.1 Description de l'existant (Processus actuel de gestion des incidents).
*   1.5.2 Critique de l'existant (Limites, temps de traitement manuel).
*   1.5.3 Solutions envisagées (Comparatif outils du marché vs développement interne).
*   1.5.4 Objectif à atteindre (Automatisation et intelligence).
### 1.6 Périmètre du Projet (cahier des charges point 4)
*   Le système couvrira : Collecte, Analyse ML, Automatisation, Reporting.
*   Le projet n'inclut pas : Réécriture complète des règles SIEM existantes.
*   Approche de développement : Simulation justifiée des logs SIEM pour le PFE.
### 1.7 Spécification des Besoins
*   1.7.1 Identification des acteurs (Analyste SOC, Administrateur).
*   1.7.2 Besoins fonctionnels (Gestion alertes, Dashboard, ML, Utilisateurs).
*   1.7.3 Besoins non fonctionnels (Performance, Sécurité, Ergonomie).
*   1.7.4 Diagramme de cas d'utilisation global.
### 1.8 Conclusion

---

## 💻 CHAPITRE 2 : Technologies et Environnement de Développement (15-18 pages)
### 2.1 Introduction
### 2.2 Environnement et Outils de Développement
*   2.2.1 Environnement matériel (PC développement).
*   2.2.2 Environnement logiciel (VS Code, Git, Postman).
### 2.3 Technologies Utilisées (cahier des charges point 6)
*   **Backend :** Node.js (Express.js), Python (scikit-learn, Joblib), API REST.
*   **Frontend :** React.js 19, TypeScript, Recharts (Visualisation), Tailwind CSS.
*   **Base de Données :** MongoDB (NoSQL) via Mongoose.
*   **Sécurité :** JWT (JSON Web Token), Hachage de mots de passe (Bcrypt).
### 2.4 Méthodologie de Travail
*   2.4.1 Introduction (Approche Agile).
*   2.4.2 Méthode adoptée : SCRUM.
*   2.4.3 Adaptation du planning du cahier des charges en sprints.
### 2.5 Architecture du Système (cahier des charges point 5)
*   **2.5.1 Vue d'Ensemble :** Architecture Modulaire Monolithique.
    *   *Schéma architectural complet.*
*   **2.5.2 Architecture Logique (3-Niveaux / 5 Couches) :**
    *   *Présentation* (React).
    *   *Logique Métier* (Services Node.js & Scripts Python).
    *   *Accès aux Données* (Mongoose Models).
*   **2.5.3 Détail des Couches Techniques :**
    *   Couche 1 : Frontend (React Components, Contexts).
    *   Couche 2 : API REST (Express Routes & Controllers).
    *   Couche 3 : Services (ML Integration, Email Notification, Automation Logic).
    *   Couche 4 : Modèles de Données (Schemas MongoDB).
    *   Couche 5 : Persistance (MongoDB Database).
*   **2.5.4 Communication Frontend-Backend :** API REST JSON.
### 2.6 Algorithme de Machine Learning : Random Forest
*   2.6.1 Choix de l'Algorithme (Pourquoi Random Forest ? Robustesse, interprétabilité).
*   2.6.2 Données Utilisées (Features : IP, Port, Type d'attaque, Sévérité).
*   2.6.3 Résultats Attendus (Classification, Score de risque).
### 2.7 Backlog du Produit
### 2.8 Planification des Sprints
*   Sprint 1 : Collecte & Authentification.
*   Sprint 2 : Moteur ML & Analyse.
*   Sprint 3 : Automatisation & Dashboard.
### 2.9 Conclusion

---

## 🛠️ CHAPITRE 3 : Sprint 1 - Collecte et Prétraitement des Alertes (20-25 pages)
### 3.1 Introduction
### 3.2 Backlog du Sprint 1
### 3.3 Spécifications Fonctionnelles (cahier des charges point 8.1)
*   3.3.1 Classification des cas d'utilisation (Authentification, Ingestion logs).
*   3.3.2 Diagramme de cas d'utilisation détaillé Sprint 1.
### 3.4 Conception
*   3.4.1 Diagramme de séquence (Flux d'authentification).
*   3.4.2 Diagramme de classe (User, Alert - partie base).
### 3.5 Réalisation
*   3.5.1 Les interfaces d'authentification (Login, Register).
*   3.5.2 Module de collecte des alertes SIEM (Simulation via scripts / API Ingest).
*   3.5.3 Les interfaces de gestion des utilisateurs (Profil, Rôles).
### 3.6 Conclusion

---

## 🧠 CHAPITRE 4 : Sprint 2 - Analyse et Classification Intelligente (22-28 pages)
### 4.1 Introduction
### 4.2 Backlog du Sprint 2
### 4.3 Spécifications Fonctionnelles (Analyste SOC)
*   4.3.1 Analyse automatique (Appel API vers Python).
*   4.3.2 Classification des alertes (Low, Medium, High, Critical).
*   4.3.3 Détection des Faux Positifs.
### 4.4 Spécifications Fonctionnelles (Admin)
*   4.4.1 Entraînement du Modèle ML (Script `train_model.py`).
*   4.4.2 Évaluation de la performance (Métriques : Accuracy, Precision).
### 4.5 Conception
*   4.5.1 Diagramme de classes mis à jour (Ajout attributs ML : `riskScore`, `prediction`).
*   4.5.2 Diagramme de séquence (Processus d'analyse d'une alerte : Node -> Python -> DB).
### 4.6 Implémentation du Modèle Random Forest
*   4.6.1 Préparation du dataset (Nettoyage, Encodage).
*   4.6.2 Entraînement du modèle (Scikit-learn).
*   4.6.3 Intégration Backend (Child Process Node.js).
### 4.7 Réalisation
*   4.7.1 Interfaces d'analyse (Détail d'une alerte avec score IA).
*   4.7.2 Affichage des prédictions (Badges, Codes couleurs).
### 4.8 Conclusion

---

## ⚡ CHAPITRE 5 : Sprint 3 - Automatisation SOC et Tableau de Bord (22-28 pages)
### 5.1 Introduction
### 5.2 Backlog du Sprint 3
### 5.3 Spécifications Fonctionnelles
*   5.3.1 Automatisation SOC (Réponse automatique, Envoi Email).
*   5.3.2 Tableau de Bord (Statistiques globales, KPI).
*   5.3.3 Reporting (Export PDF/CSV, Vues synthétiques).
### 5.4 Conception
*   5.4.1 Diagramme de classes final.
*   5.4.2 Diagramme de séquence (Processus d'automatisation : Règle -> Action).
### 5.5 Implémentation des Fonctionnalités
*   5.5.1 Actions automatiques (`automationService.js`).
*   5.5.2 Système de notification (`emailService.js`).
*   5.5.3 Logique du Dashboard (Agrégation des statistiques MongoDB).
### 5.6 Réalisation
*   5.6.1 Interfaces du Dashboard (Graphiques Recharts).
*   5.6.2 Interfaces de configuration des règles.
*   5.6.3 Exemple d'email d'alerte reçu.
### 5.7 Conclusion

---

## 🎯 Conclusion Générale et Perspectives (2-3 pages)
*   **Bilan du Projet :** Objectifs atteints, système fonctionnel.
*   **Apport de l'IA :** Réduction du temps d'analyse, priorisation efficace.
*   **Contraintes Respectées :** Performance, Sécurité, Délai.
*   **Livrables :** Code source, Rapport, Modèle PMML/Pickle.
*   **Limitations et Perspectives :** Intégration avec un vrai SOAR, Apprentissage en continu (Online Learning).
*   **Compétences Acquises.**

---

## 📚 Annexes
*   A. Cahier des Charges
*   B. Planning initial vs Réel
*   C. Extraits de Code Significatifs (Modèle ML, Service d'Email)
*   D. Exemples de Datasets

## 📖 Bibliographie et Webographie
