
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
import joblib

import os
# Load dataset
# Use absolute path relative to this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "../dataset/Train_Test_Network.csv")
data = pd.read_csv(DATA_PATH)

# Columns features (TON_IoT standard)
features = [
    'duration', 'proto', 'service', 'conn_state',
    'src_pkts', 'dst_pkts', 'src_bytes', 'dst_bytes'
]

X = data[features]
y = data['label']   # normal / attack

# Encode categorical features
X = pd.get_dummies(X)

# Encode labels
encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)

# Train/Test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42
)

# Random Forest
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

# Evaluation
y_pred = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))

# Save model
joblib.dump(model, "rf_ton_iot.pkl")
joblib.dump(encoder, "label_encoder.pkl")
# Important: Save the feature columns after get_dummies to align prediction input
joblib.dump(X_train.columns, "model_columns.pkl")

print("✅ Model saved")
