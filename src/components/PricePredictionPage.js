import React, { useState } from 'react';
import { useApp } from '../App';

// IMPORTANT: Replace this with your new Render URL
const API_URL = "https://cropclock-backend.onrender.com";

function PricePredictionPage() {
  const { language } = useApp();
  const t = translations[language];

  const [formData, setFormData] = useState({
    State: '',
    Crop: '',
    Season: '',
    Month: '',
    Stock_kg: '',
    Demand_Index: '',
    Storage_Cost_Index: ''
  });

  const [prediction, setPrediction] = useState(null);

  const states = ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh'];
  const crops = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane'];
  const seasons = ['Kharif', 'Rabi', 'Zaid'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    try {
      // --- UPDATED URL ---
      const response = await fetch(`${API_URL}/predict_price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.price_per_quintal) setPrediction(result);
      else alert("Error: " + result.error);
    } catch (error) {
      alert("Backend not connected");
    }
  };

  return (
    <div className="feature-page">
      <h2>{t.title}</h2>
      
      <div className="form-container">
        <div className="form-section-title">💰 Market Inputs</div>

        <form onSubmit={handlePredict}>
          <div className="form-grid">
            <div className="form-group">
              <label>Select State</label>
              <select name="State" value={formData.State} onChange={handleChange} required>
                <option value="">-- Select State --</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Select Crop</label>
              <select name="Crop" value={formData.Crop} onChange={handleChange} required>
                <option value="">-- Select Crop --</option>
                {crops.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Select Season</label>
              <select name="Season" value={formData.Season} onChange={handleChange} required>
                <option value="">-- Select Season --</option>
                {seasons.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Select Month</label>
              <select name="Month" value={formData.Month} onChange={handleChange} required>
                <option value="">-- Select Month --</option>
                {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Stock (kg)</label>
              <input type="number" name="Stock_kg" value={formData.Stock_kg} onChange={handleChange} placeholder="e.g. 1000" required/>
            </div>
            <div className="form-group">
              <label>Demand Index (1-10)</label>
              <input type="number" name="Demand_Index" value={formData.Demand_Index} onChange={handleChange} placeholder="e.g. 8" required/>
            </div>
            <div className="form-group">
              <label>Storage Cost Index (1-10)</label>
              <input type="number" name="Storage_Cost_Index" value={formData.Storage_Cost_Index} onChange={handleChange} placeholder="e.g. 2" required/>
            </div>
          </div>
          
          <button type="submit" className="submit-btn price-btn">{t.submit}</button>
        </form>

        {prediction && (
          <div style={{marginTop: '2rem', padding: '1.5rem', backgroundColor: '#ffebee', border: '2px solid #c62828', borderRadius: '12px', textAlign: 'center'}}>
            <h3 style={{margin: 0, color: '#b71c1c'}}>Predicted Price:</h3>
            <div style={{fontSize: '2.5rem', fontWeight: 'bold', color: '#b71c1c', marginTop: '0.5rem'}}>
              ₹ {parseFloat(prediction.price_per_quintal).toFixed(2)}
            </div>
            <div style={{fontSize: '1rem', color: '#b71c1c', marginTop: '0.5rem'}}>
              (per quintal)
            </div>
             <h3 style={{margin: '1rem 0 0.5rem', color: '#b71c1c'}}>Market Advice:</h3>
            <div style={{fontSize: '1.2rem', fontWeight: 'bold', color: '#b71c1c', marginTop: '0.5rem'}}>
              {prediction.recommendation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const translations = {
  en: { title: 'Price Prediction', submit: 'Predict Price' },
  ta: { title: 'விலை கணிப்பு', submit: 'விலையை கணிக்கவும்' },
};

export default PricePredictionPage;