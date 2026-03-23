
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
    model_columns = joblib.load(os.path.join(BASE_DIR, "model_columns.pkl"))
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
        
        # Convert to DataFrame
        df = pd.DataFrame([data])
        
        # One-hot encode
        df = pd.get_dummies(df)
        
        # Align columns
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

