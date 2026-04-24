import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score
import joblib
import json
import os

# Paths
DATA_PATH = os.path.join("dataset", "Train_Test_Network.csv")
MODEL_DIR = "ml"

print("Loading cleaned dataset...")
df = pd.read_csv(DATA_PATH)

# Select features
# We exclude IPs and ports for better generalization
# We exclude 'type' because it's exactly correlated with 'label' (it's the sub-class)
target = 'label'
exclude_cols = ['src_ip', 'dst_ip', 'src_port', 'dst_port', 'label', 'type']
features = [col for col in df.columns if col not in exclude_cols]

print(f"Features selected: {features}")

# Handle categorical variables
categorical_cols = df[features].select_dtypes(include=['object']).columns.tolist()
print(f"Categorical features to encode: {categorical_cols}")

# Processing
df_processed = df[features].copy()

# Fill '-' with 'none'
for col in categorical_cols:
    df_processed[col] = df_processed[col].astype(str).replace('-', 'none')

# One-Hot Encoding
df_final = pd.get_dummies(df_processed, columns=categorical_cols)
model_columns = df_final.columns.tolist()

# Prepare X and y
X = df_final
y = df[target]

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

print(f"Training set size: {len(X_train)}")
print(f"Testing set size: {len(X_test)}")

# Train model
print("Training Random Forest model (this might take a moment)...")
rf = RandomForestClassifier(n_estimators=50, max_depth=10, random_state=42, n_jobs=-1)
rf.fit(X_train, y_train)

# Evaluate
y_pred = rf.predict(X_test)
print("\n--- Model Evaluation ---")
print(f"Accuracy: {accuracy_score(y_test, y_pred):.4%}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# Save artifacts
print("\nSaving model artifacts...")
os.makedirs(MODEL_DIR, exist_ok=True)
joblib.dump(rf, os.path.join(MODEL_DIR, "rf_ton_iot_new.pkl"))

# Save the column names
with open(os.path.join(MODEL_DIR, "model_columns_new.json"), "w") as f:
    json.dump(model_columns, f)

print("Done! Model trained and saved as 'rf_ton_iot_new.pkl'")
