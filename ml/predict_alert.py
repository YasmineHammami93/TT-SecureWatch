
import pandas as pd
import joblib
import os

# Load model, encoder, and columns
try:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    model = joblib.load(os.path.join(BASE_DIR, "rf_ton_iot.pkl"))
    encoder = joblib.load(os.path.join(BASE_DIR, "label_encoder.pkl"))
    # model_columns = joblib.load("model_columns.pkl") 
    # Commented out because I might have forgot to save it in train_model.py? 
    # Wait, I did save it in step 79.
    model_columns = joblib.load(os.path.join(BASE_DIR, "model_columns.pkl"))

    alert = {
        'duration': 0.5,
        'proto': 'tcp',
        'service': 'http',
        'conn_state': 'SF', 
        'src_pkts': 20,
        'dst_pkts': 15,
        'src_bytes': 2000,
        'dst_bytes': 1500
    }

    df = pd.DataFrame([alert])
    
    # One-hot encode
    df = pd.get_dummies(df)

    # Align columns with training data
    df = df.reindex(columns=model_columns, fill_value=0)

    prediction = model.predict(df)
    result = encoder.inverse_transform(prediction)

    print("🚨 Alert classified as:", result[0])

except FileNotFoundError:
    print("Error: Model files not found. Run train_model.py first.")
except Exception as e:
    print(f"An error occurred: {e}")
