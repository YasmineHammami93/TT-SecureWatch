
from flask import Flask, request, jsonify
import pandas as pd
import joblib
import os
import numpy as np

app = Flask(__name__)

# Load model artifacts
try:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    model = joblib.load(os.path.join(BASE_DIR, "rf_ton_iot_new.pkl"))
    # The new model doesn't need a separate label encoder since it's 0/1
    # encoder = joblib.load(os.path.join(BASE_DIR, "label_encoder.pkl")) 
    with open(os.path.join(BASE_DIR, "model_columns_new.json"), "r") as f:
        import json
        model_columns = json.load(f)
    print("New Model loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

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
        return jsonify({'error': 'Model not loaded'}), 500

    try:
        data = request.get_json()
        
        # 1. Start with zeros for all columns
        input_data = pd.DataFrame(np.zeros((1, len(model_columns))), columns=model_columns)
        
        # 2. Fill numeric columns
        numeric_map = {
            'duration': data.get('dur', data.get('duration', 0.0)),
            'src_bytes': data.get('sbytes', data.get('src_bytes', 0)),
            'dst_bytes': data.get('dbytes', data.get('dst_bytes', 0)),
            'missed_bytes': data.get('missed_bytes', 0),
            'src_pkts': data.get('spkts', data.get('src_pkts', 0)),
            'dst_pkts': data.get('dpkts', data.get('dst_pkts', 0)),
            'src_ip_bytes': data.get('src_ip_bytes', 0),
            'dst_ip_bytes': data.get('dst_ip_bytes', 0),
            'dns_qclass': data.get('dns_qclass', 0),
            'dns_qtype': data.get('dns_qtype', 0),
            'dns_rcode': data.get('dns_rcode', 0),
            'http_request_body_len': data.get('http_request_body_len', 0),
            'http_response_body_len': data.get('http_response_body_len', 0),
            'http_status_code': data.get('http_status_code', 0),
        }
        
        for col, val in numeric_map.items():
            if col in input_data.columns:
                input_data.at[0, col] = float(val) if val != '-' else 0

        # 3. Fill categorical columns (One-Hot)
        cat_map = {
            'proto': data.get('proto', 'tcp').lower(),
            'service': data.get('service', 'none').lower(),
            'conn_state': data.get('state', data.get('conn_state', 'SF')).upper(),
            'dns_query': data.get('dns_query', 'none'),
            'dns_AA': data.get('dns_AA', 'none'),
            'dns_RD': data.get('dns_RD', 'none'),
            'dns_RA': data.get('dns_RA', 'none'),
            'dns_rejected': data.get('dns_rejected', 'none'),
        }

        for feature, val in cat_map.items():
            col_name = f"{feature}_{val}"
            if col_name in input_data.columns:
                input_data.at[0, col_name] = 1
        
        # Predict
        prediction = int(model.predict(input_data)[0])
        probabilities = model.predict_proba(input_data)[0]
        confidence = float(probabilities[prediction])
        
        risk_score = calculate_risk_score(prediction, confidence)
        risk_level = get_risk_level(risk_score)
        
        result = {
            'prediction': prediction,
            'confidence': confidence,
            'risk_score': round(risk_score),
            'risk_level': risk_level
        }
        
        print(f"[New Model] Prediction: {prediction}, Confidence: {confidence:.2%}, Risk: {risk_score:.0f}")
        return jsonify(result)

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(port=5000, debug=True)

