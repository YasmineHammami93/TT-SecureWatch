from flask import Flask, request, jsonify
import pandas as pd
import joblib
import os
import sys
import numpy as np

app = Flask(__name__)

# --- Configuration ---
# Current directory is backend/, models are in ml/
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.join(BASE_DIR, '..', 'ml')

MODEL_PATH = os.path.join(ML_DIR, "rf_ton_iot.pkl")
ENCODER_PATH = os.path.join(ML_DIR, "label_encoder.pkl")
COLUMNS_PATH = os.path.join(ML_DIR, "model_columns.pkl")

# Load model artifacts
model = None
try:
    if os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH) and os.path.exists(COLUMNS_PATH):
        model = joblib.load(MODEL_PATH)
        encoder = joblib.load(ENCODER_PATH)
        model_columns = joblib.load(COLUMNS_PATH)
        print(f"✅ Model loaded successfully from {ML_DIR}", file=sys.stderr)
    else:
        print(f"❌ Model files not found in {ML_DIR}", file=sys.stderr)
        print(f"Looking for: {MODEL_PATH}", file=sys.stderr)
except Exception as e:
    print(f"❌ Error loading model: {e}", file=sys.stderr)

def calculate_risk_score(prediction, confidence):
    """
    Calculate a risk score from 0-100 based on prediction and confidence.
    """
    if prediction == 1:  # Attack
        risk_score = 50 + (confidence * 50)
    else:  # Normal
        risk_score = 50 - (confidence * 50)
    
    return min(100, max(0, risk_score))

def get_risk_level(risk_score):
    if risk_score >= 85: return "Critique"
    elif risk_score >= 65: return "Haute"
    elif risk_score >= 40: return "Moyenne"
    else: return "Faible"

@app.route('/predict', methods=['POST'])
def predict():
    if not model:
        return jsonify({'error': 'Model not loaded', 'status': 'error'}), 500

    try:
        data = request.get_json()
        if not data:
             return jsonify({'error': 'No data provided', 'status': 'error'}), 400

        # Create DataFrame from single data point
        df = pd.DataFrame([data])
        
        # One-hot encode (aligning with training columns)
        df = pd.get_dummies(df)
        df = df.reindex(columns=model_columns, fill_value=0)
        
        # Predict
        prediction = model.predict(df)[0]
        probabilities = model.predict_proba(df)[0]
        confidence = probabilities[prediction]
        
        risk_score = calculate_risk_score(prediction, confidence)
        risk_level = get_risk_level(risk_score)
        
        result = {
            'prediction': int(prediction),
            'confidence': float(confidence),
            'risk_score': round(risk_score),
            'risk_level': risk_level,
            'status': 'success'
        }
        
        # Log to stderr so Node.js can potentially see it if needed, or just for debugging
        print(f"Prediction: {prediction}, Risk: {risk_score}", file=sys.stderr)
        
        return jsonify(result)

    except Exception as e:
        print(f"Prediction error: {e}", file=sys.stderr)
        return jsonify({'error': str(e), 'status': 'error'}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "UP", "model_loaded": model is not None})

if __name__ == '__main__':
    # Run on port 5000
    app.run(host='0.0.0.0', port=5000)
