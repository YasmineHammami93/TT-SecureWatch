
from flask import Flask, request, jsonify
import pandas as pd
import joblib
import os
import numpy as np

app = Flask(__name__)

# Load model artifacts
try:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    model = joblib.load(os.path.join(BASE_DIR, "rf_ton_iot.pkl"))
    encoder = joblib.load(os.path.join(BASE_DIR, "label_encoder.pkl"))
    with open(os.path.join(BASE_DIR, "model_columns.json"), "r") as f:
        import json
        model_columns = json.load(f)
    print("✅ Model loaded successfully")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

def calculate_risk_score(prediction, confidence):
    """
    Calculate a risk score from 0-100 based on prediction and confidence.
    - Si Attack (prediction=1): score = 50 + (confidence * 50) → 50-100
    - Si Normal (prediction=0): score = 50 - (confidence * 50) → 0-50
    """
    if prediction == 1:  # Attack
        # Plus la confiance est haute, plus le risque est élevé (50-100)
        risk_score = 50 + (confidence * 50)
    else:  # Normal
        # Plus la confiance est haute que c'est normal, plus le risque est bas (0-50)
        risk_score = 50 - (confidence * 50)
    
    return min(100, max(0, risk_score))

def get_risk_level(risk_score):
    """
    Map risk score (0-100) to risk level.
    """
    if risk_score >= 85:
        return "Critique"
    elif risk_score >= 65:
        return "Haute"
    elif risk_score >= 40:
        return "Moyenne"
    else:
        return "Faible"

@app.route('/predict', methods=['POST'])
def predict():
    if not model:
        return jsonify({'error': 'Model not loaded'}), 500

    try:
        data = request.get_json()
        
        # Map ToN-IoT original columns to what the model expects
        mapped_data = {
            'duration': data.get('dur', data.get('duration', 0.0)),
            'src_pkts': data.get('spkts', data.get('src_pkts', 0)),
            'dst_pkts': data.get('dpkts', data.get('dst_pkts', 0)),
            'src_bytes': data.get('sbytes', data.get('src_bytes', 0)),
            'dst_bytes': data.get('dbytes', data.get('dst_bytes', 0)),
        }

        # Handle categorical features (one-hot encode manually since we know the columns)
        proto = data.get('proto', 'tcp').lower()
        mapped_data[f'proto_{proto}'] = 1

        service = data.get('service', '-').lower()
        mapped_data[f'service_{service}'] = 1

        conn_state = data.get('state', data.get('conn_state', 'SF')).upper()
        mapped_data[f'conn_state_{conn_state}'] = 1
        
        # Convert to DataFrame
        df = pd.DataFrame([mapped_data])
        
        # Align columns with exact expected model columns
        df = df.reindex(columns=model_columns, fill_value=0)
        
        # Predict class and probability
        prediction = model.predict(df)[0]
        probabilities = model.predict_proba(df)[0]
        
        # Get probability of the predicted class
        confidence = probabilities[prediction]
        
        # Calculate risk score (0-100)
        risk_score = calculate_risk_score(prediction, confidence)
        
        # Get risk level based on score
        risk_level = get_risk_level(risk_score)
        
        result = {
            'prediction': int(prediction),
            'confidence': float(confidence),
            'risk_score': round(risk_score),  # Score 0-100
            'risk_level': risk_level
        }
        
        print(f"🔍 Prediction: {prediction}, Confidence: {confidence:.2%}, Risk Score: {risk_score:.0f}, Level: {risk_level}")
        
        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(port=5000, debug=True)

