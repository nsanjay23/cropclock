from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd
from flask_cors import CORS
import os
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------
# 1. CONFIGURE GOOGLE AI (GEMINI)
# ---------------------------------------------------------
try:
    # --- PASTE YOUR KEY HERE ---
    genai.configure(api_key="AIzaSyA5GiGaF24Li_AyaDoD1eHT1hB1WvzQPFI")
    
    # This is the "personality" and "knowledge" of your chatbot
    system_prompt = """
    You are "CropClock AI", a friendly and helpful farming assistant.
    
    --- NEW RULE ---
    Your answers must be very concise, friendly, and short. Keep them to one or two sentences if possible.
    --- END NEW RULE ---
    
    Your knowledge is for farmers in India.
    You are multilingual and can speak languages like Tamil and English.
    You CANNOT make predictions yourself, but you must guide users to the app's features.
    
    The app has three features:
    1. Smart Crop Recommendation: Predicts the best crop based on N, P, K, pH, and weather.
    2. Fertilizer Recommendation: Recommends fertilizer based on soil, crop, and NPK values.
    3. Price Prediction: Predicts the market price for crops.
    
    If a user asks for a prediction (e.g., "What crop should I plant?"), do NOT give a specific crop.
    Instead, guide them to the correct feature, like: "I can't tell you the exact crop, but you can find out
    using our 'Smart Crop Recommendation' feature!"
    
    For general questions (e.g., "What is a good way to manage pests?"), provide a helpful, concise answer.
    """
    
    ai_model = genai.GenerativeModel(
        'gemini-2.5-flash-preview-09-2025',
        generation_config={"temperature": 0.8},
        system_instruction=system_prompt
    )
    
    chat_session = ai_model.start_chat()
    
    print("✅ Gemini AI Model loaded successfully!")

except Exception as e:
    print(f"❌ Error loading Gemini: {e}")
    chat_session = None

# ---------------------------------------------------------
# 2. LOAD YOUR ML MODELS (Existing Code)
# ---------------------------------------------------------
try:
    crop_model = joblib.load("crop_recommendation_model.pkl")
    price_model = joblib.load("crop_price_model.pkl")
    le_state = joblib.load("le_state.pkl")
    le_crop = joblib.load("le_crop.pkl")
    le_season = joblib.load("le_season.pkl")
    fert_model = joblib.load("fertilizer_model.pkl")
    fert_soil = joblib.load("fert_soil_encoder.pkl")
    fert_crop = joblib.load("fert_crop_encoder.pkl")
    fert_label = joblib.load("fert_label_encoder.pkl")
    npk_model = joblib.load("npk_model_pipeline.joblib")
    print("✅ All .pkl models loaded successfully!")
except Exception as e:
    print(f"❌ Error loading .pkl models: {e}")

# ---------------------------------------------------------
# 3. ROUTES
# ---------------------------------------------------------

# --- NEW CHATBOT ROUTE ---
@app.route('/chat', methods=['POST'])
def chat_with_ai():
    if not chat_session:
        return jsonify({"error": "AI model is not configured. Check server logs."}), 500
        
    try:
        data = request.json
        user_message = data.get('message')
        
        if not user_message:
            return jsonify({"error": "No message provided."}), 400
            
        # Send the user's message to Gemini
        response = chat_session.send_message(user_message)
        
        # Return the AI's text response
        return jsonify({'reply': response.text})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Your existing model routes (no changes needed) ---

@app.route('/predict', methods=['POST'])
def predict_crop():
    try:
        data = request.get_json()
        X = np.array([[
            float(data["N"]),
            float(data["P"]),
            float(data["K"]),
            float(data["temperature"]),
            float(data["humidity"]),
            float(data["ph"]),
            float(data["rainfall"])
        ]])
        result = crop_model.predict(X)[0]
        return jsonify({"crop": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/predict_price', methods=['POST'])
def predict_price():
    try:
        data = request.get_json()
        state = le_state.transform([data["State"]])[0]
        crop = le_crop.transform([data["Crop"]])[0]
        season = le_season.transform([data["Season"]])[0]
        month = int(data["Month"])
        stock = float(data["Stock_kg"])
        demand = float(data["Demand_Index"])
        storage_cost = float(data["Storage_Cost_Index"])
        X = [[state, crop, season, month, stock, demand, storage_cost]]
        predicted = price_model.predict(X)[0]
        price_quintal = round(predicted, 2)
        price_kg = round(price_quintal / 100, 2)
        total_value = round(price_quintal * (stock / 100), 2)
        if demand >= 8 and storage_cost <= 4:
            recommendation = "Hold for 3–4 weeks (High demand, storage cost low)"
        elif demand >= 6 and storage_cost <= 6:
            recommendation = "Hold for 1–2 weeks (Moderate demand & storage cost)"
        elif demand >= 6 and storage_cost > 6:
            recommendation = "Hold for 1 week (Moderate demand, but storage costly)"
        elif demand <= 4 and storage_cost <= 4:
            recommendation = "Hold for 5–7 days (Demand low but storage is cheap)"
        else:
            recommendation = "Sell immediately (Low demand or high storage cost)"
        return jsonify({
            "price_per_quintal": price_quintal,
            "price_per_kg": price_kg,
            "total_value": total_value,
            "recommendation": recommendation
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/predict_fertilizer', methods=['POST'])
def predict_fertilizer():
    try:
        data = request.get_json()
        soil = fert_soil.transform([data["Soil_Type"]])[0]
        crop = fert_crop.transform([data["Crop_Type"]])[0]
        X = [[
            float(data["Temperature"]),
            float(data["Humidity"]),
            float(data["Soil_Moisture"]),
            soil, crop,
            float(data["Nitrogen"]),
            float(data["Potassium"]),
            float(data["Phosphorus"])
        ]]
        pred = fert_model.predict(X)[0]
        fert_name = fert_label.inverse_transform([pred])[0]
        return jsonify({"Recommended_Fertilizer": fert_name})
    except Exception as e:
        return jsonify({"error": "Invalid input or unseen category: " + str(e)}), 400

@app.route('/predict_npk', methods=['POST'])
def predict_npk():
    try:
        data = request.get_json()
        df = pd.DataFrame([{
            "soil_type": data["soil_type"],
            "prev_crop": data["prev_crop"],
            "yield_level": data["yield_level"],
            "tempC": float(data["tempC"]),
            "humidity": float(data["humidity"]),
            "rainfall": float(data["rainfall"])
        }])
        pred = npk_model.predict(df)[0]
        return jsonify({
            "N": int(pred[0]),
            "P": int(pred[1]),
            "K": int(pred[2])
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True, port=5000)