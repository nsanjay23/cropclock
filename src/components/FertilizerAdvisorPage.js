import React, { useState, useEffect } from 'react';
import { useApp } from '../App';

function FertilizerAdvisorPage() {
  const { language } = useApp();
  const t = translations[language];

  const [locationStatus, setLocationStatus] = useState('Detecting location...');
  
  // Mock data for dropdowns
  const soilTypes = ['Clay', 'Sandy', 'Loamy', 'Black', 'Red'];
  const crops = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane'];

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocationStatus(`Location Detected: ${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`),
        (error) => setLocationStatus("Location access denied.")
      );
    }
  }, []);

  return (
    <div className="feature-page">
      <h2>{t.title}</h2>
      
      <div className="form-container">
        <div className="location-status">📍 {locationStatus}</div>
        <div className="form-section-title">🌿 Fertilizer Recommendation</div>

        <form>
          <div className="form-grid">
            <div className="form-group">
              <label>Temperature (°C)</label>
              <input type="number" placeholder="e.g., 26" />
            </div>
            <div className="form-group">
              <label>Humidity (%)</label>
              <input type="number" placeholder="e.g., 80" />
            </div>
            <div className="form-group">
              <label>Soil Moisture</label>
              <input type="number" placeholder="e.g., 60" />
            </div>
            <div className="form-group">
              <label>Nitrogen (N)</label>
              <input type="number" placeholder="e.g., 40" />
            </div>
            <div className="form-group">
              <label>Potassium (K)</label>
              <input type="number" placeholder="e.g., 20" />
            </div>
            <div className="form-group">
              <label>Phosphorus (P)</label>
              <input type="number" placeholder="e.g., 30" />
            </div>
            <div className="form-group">
              <label>Select Soil Type</label>
              <select>
                <option value="">-- Select Soil --</option>
                {soilTypes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Select Crop</label>
              <select>
                <option value="">-- Select Crop --</option>
                {crops.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          
          {/* Blueish button as per image */}
          <button type="button" className="submit-btn advisor-btn">{t.submit}</button>
        </form>
      </div>
    </div>
  );
}

const translations = {
  en: {
    title: 'Fertilizer Advisor',
    submit: 'Recommend Fertilizer',
  },
  ta: {
    title: 'உர ஆலோசகர்',
    submit: 'உரத்தை பரிந்துரைக்கவும்',
  },
};

export default FertilizerAdvisorPage;