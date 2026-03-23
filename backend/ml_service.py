import pandas as pd # Importation de pandas pour la manipulation des données (DataFrames)
from sklearn.ensemble import RandomForestClassifier # Import du modèle Random Forest
from sklearn.model_selection import train_test_split # Pour séparer les données en test/train
from sklearn.preprocessing import LabelEncoder # Pour convertir le texte en nombres (encodage)
import joblib # Pour sauvegarder et charger le modèle entraîné sur le disque
import json # Pour gérer les entrées/sorties JSON
import sys # Pour récupérer les arguments de la ligne de commande
import os # Pour les opérations sur le système de fichiers
from pymongo import MongoClient # Connecteur MongoDB pour Python
import datetime # Pour gérer les horodatages
import uuid # Pour générer des identifiants uniques

# --- Configuration des chemins ---
# Répertoire où se trouve le script actuel
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
# Chemin de sauvegarde du modèle entraîné
MODEL_PATH = os.path.join(MODEL_DIR, 'random_forest_model.joblib')
# Chemin de sauvegarde des encodeurs (pour transformer les nouvelles données comme lors de l'entraînement)
ENCODER_PATH = os.path.join(MODEL_DIR, 'encoders.joblib')
# Répertoire des données d'entraînement (CSV)
DATA_DIR = os.path.join(MODEL_DIR, 'data')

class SecureAlertML:
    def __init__(self):
        self.model = None # Le modèle sera chargé ici
        self.encoders = {} # Dictionnaire pour stocker les encodeurs de chaque colonne
        # Caractéristiques catégorielles (texte) du dataset UNSW-NB15
        self.categorical_features = ['proto', 'service', 'state']
        # Caractéristiques numériques du dataset
        self.numerical_features = ['dur', 'spkts', 'dpkts', 'sbytes', 'dbytes', 'rate', 'sttl', 'dttl', 'sload', 'dload', 'sloss', 'dloss']
        # Liste complète des features utilisées pour la prédiction
        self.features = self.categorical_features + self.numerical_features
        # Connexion DB (initialisée plus tard si besoin)
        self.mongo_client = None
        self.db = None
        self.collection = None

    def connect_mongodb(self, uri="mongodb://localhost:27017/", db_name="soc_alerts_db"):
        """
        Établit la connexion à la base de données MongoDB pour sauvegarder les résultats.
        """
        try:
            self.mongo_client = MongoClient(uri)
            self.db = self.mongo_client[db_name]
            self.collection = self.db["alerts"]
            # Pas de print ici pour ne pas corrompre la sortie standard (stdout) qui est lue par Node.js
            return True
        except Exception as e:
            print(f"Failed to connect to MongoDB: {e}", file=sys.stderr) # Erreur sur stderr uniquement
            return False

    def generate_alert_document(self, alert_data, prediction_result):
        """
        Formate l'alerte et le résultat de la prédiction en un objet JSON prêt pour MongoDB.
        """
        # Mapping simple entre les classes prédites et la sévérité affichée
        severity_map = {
            'Critical': 'CRITIQUE',
            'High': 'ÉLEVÉE',
            'Medium': 'MOYENNE',
            'Low': 'FAIBLE',
            'Info': 'INFO'
        }
        
        pred_class = prediction_result['predicted_class']
        mapped_severity = severity_map.get(pred_class, 'MOYENNE') # Valeur par défaut si non trouvée

        # Construction du document
        alert_doc = {
            "id": f"ALT-{uuid.uuid4().hex[:6].upper()}", # ID unique généré
            "timestamp": datetime.datetime.now(), # Date actuelle
            "source": alert_data.get('source_siem', 'Unknown'), # Source (Wazuh, QRadar...)
            "sourceIp": alert_data.get('src_ip', '192.168.1.1'), # IP Source
            "destinationIp": alert_data.get('dst_ip', '10.0.0.1'),
            "severity": mapped_severity, # Sévérité déduite
            "status": "NOUVEAU", # Statut initial pour le Dashboard
            "description": alert_data.get('alert_type', 'Suspicious Activity'),
            "affectedSystem": alert_data.get('affected_system', 'Unknown'),
            # Log brut incluant le résultat ML
            "rawLog": f"ML Analysis: {pred_class} with {prediction_result['confidence_score']:.2f} confidence",
            # Données spécifiques ML stockées dans un sous-objet pour affichage détaillé
            "mlData": {
                "predictedClass": pred_class,
                "confidenceScore": prediction_result['confidence_score'],
                "riskScore": prediction_result['risk_score'],
                "isAutomated": prediction_result['risk_score'] > 90 # Automatisation si risque > 90%
            }
        }
        return alert_doc
        
    def train(self, train_path=None, test_path=None):
        """
        Entraîne le modèle Random Forest sur les données UNSW-NB15.
        """
        # Chemins par défaut si non spécifiés
        if not train_path:
            train_path = os.path.join(DATA_DIR, 'UNSW_NB15_training-set.csv')
        if not test_path:
            test_path = os.path.join(DATA_DIR, 'UNSW_NB15_testing-set.csv')

        # Vérification de l'existence du fichier
        if not os.path.exists(train_path):
            print(f"Error: Training file not found at {train_path}", file=sys.stderr)
            return False

        print(f"Loading data from {train_path}...", file=sys.stderr)
        df_train = pd.read_csv(train_path)
        
        df = df_train.copy()

        # Nettoyage des données : remplacement des tirets et valeurs nulles
        df = df.replace('-', 'unknown').fillna(0)

        # Encodage des colonnes texte en nombres (Label Encoding)
        for col in self.categorical_features + ['attack_cat']:
            if col in df.columns:
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col].astype(str))
                self.encoders[col] = le # On sauvegarde l'encodeur pour pouvoir l'utiliser lors des prédictions

        # Sélection des features (X) et de la cible (y)
        X = df[self.features]
        y = df['label'] # Label binaire : 0 = Normal, 1 = Attaque

        # Division pour validation (80% train, 20% test)
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        print("Training Random Forest model...", file=sys.stderr)
        # Création et entraînement du modèle (100 arbres)
        self.model = RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1)
        self.model.fit(X_train, y_train)

        # Sauvegarde du modèle et des encodeurs sur le disque
        joblib.dump(self.model, MODEL_PATH)
        joblib.dump(self.encoders, ENCODER_PATH)
        print(f"Model trained successfully. Accuracy on test: {self.model.score(X_test, y_test):.4f}", file=sys.stderr)
        return True

    def load_model(self):
        """
        Charge le modèle existant depuis le disque.
        """
        if os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH):
            self.model = joblib.load(MODEL_PATH)
            self.encoders = joblib.load(ENCODER_PATH)
            return True
        return False

    def predict(self, alert_data):
        """
        Prédit la classe (Attaque/Normal) et le score de confiance pour une nouvelle alerte.
        """
        # Si le modèle n'est pas chargé, on essaie de le charger, sinon on entraîne
        if not self.model:
            if not self.load_model():
                self.train()

        # Préparation du vecteur d'entrée correspondant aux features attendues
        input_row = []
        for feature in self.features:
            val = alert_data.get(feature, 0)
            
            # Traitement spécifique pour les catéogies : on doit utiliser l'encodeur
            if feature in self.categorical_features:
                val = str(val)
                # Gestion des catégories inconnues (jamais vues lors de l'entraînement)
                if val not in self.encoders[feature].classes_:
                    input_row.append(-1) # Valeur par défaut pour inconnu
                else:
                    input_row.append(self.encoders[feature].transform([val])[0])
            else:
                # Traitement des valeurs numériques
                try:
                    input_row.append(float(val))
                except:
                    input_row.append(0)

        # Prédiction de la classe (0 ou 1)
        prediction = self.model.predict([input_row])[0]
        # Prédiction des probabilités pour avoir le score de confiance
        probabilities = self.model.predict_proba([input_row])[0]
        confidence = max(probabilities) # La probabilité la plus élevée est notre confiance

        # Traduction du résultat numérique en texte
        predicted_class = "Attack" if prediction == 1 else "Normal"

        return {
            'predicted_class': predicted_class,
            'confidence_score': float(confidence),
            'risk_score': int(confidence * 100) # Score sur 100
        }

    def save_alert(self, alert_doc):
        """
        Sauvegarde le document final dans MongoDB.
        """
        if self.collection is not None:
            try:
                self.collection.insert_one(alert_doc)
                return True
            except Exception as e:
                print(f"[ERR] Error inserting alert: {e}", file=sys.stderr)
        return False

# --- Point d'entrée principal du script ---
if __name__ == "__main__":
    ml = SecureAlertML() # Instanciation de la classe
    
    # Vérification des arguments
    if len(sys.argv) > 1:
        command = sys.argv[1] # "train" ou "predict"
        
        if command == "train":
            ml.train() # Lance l'entraînement
            
        elif command == "predict":
            # Récupération du JSON passé en argument 2
            input_json = sys.argv[2]
            alert = json.loads(input_json)
            
            # Prédiction
            result = ml.predict(alert)
            
            # Si le flag --save est présent, on sauvegarde en base
            if "--save" in sys.argv:
                ml.connect_mongodb()
                alert_doc = ml.generate_alert_document(alert, result)
                ml.save_alert(alert_doc)
                # On ajoute l'ID généré au résultat pour que Node.js puisse le savoir
                result['id'] = alert_doc['id']

            # On affiche le résultat en JSON sur la sortie standard pour que Node.js le récupère
            print(json.dumps(result))
