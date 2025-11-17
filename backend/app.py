from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app) # This allows your React app to talk to this Python app

# Load your model
# Make sure the file name matches exactly what you have
model = joblib.load('crop_recommendation_model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # Extract data from the frontend
        # IMPORTANT: These must match the order your model was trained on!
        # Usually: N, P, K, Temperature, Humidity, pH, Rainfall
        features = [
            float(data['nitrogen']),
            float(data['phosphorus']),
            float(data['potassium']),
            float(data['temperature']),
            float(data['humidity']),
            float(data['ph']),
            float(data['rainfall'])
        ]
        
        # Make prediction
        final_features = [np.array(features)]
        prediction = model.predict(final_features)
        
        # Return the result
        return jsonify({'prediction': prediction[0]})

    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True, port=5000)