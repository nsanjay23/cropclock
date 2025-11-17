import React, { useState } from 'react';
import { useApp } from '../App';

function PricePredictionPage() {
  const { language } = useApp();
  const t = translations[language];

  // Mock Data for Dropdowns
  const states = ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh'];
  const crops = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane'];
  const seasons = ['Kharif', 'Rabi', 'Zaid'];

  return (
    <div className="feature-page">
      <h2>{t.title}</h2>
      
      <div className="form-container">
        <div className="form-section-title">💰 Market Price Prediction</div>

        <form>
          <div className="form-grid">
            <div className="form-group">
              <label>Select State</label>
              <select>
                <option value="">-- Select State --</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Select Crop</label>
              <select>
                <option value="">-- Select Crop --</option>
                {crops.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Select Season</label>
              <select>
                <option value="">-- Select Season --</option>
                {seasons.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Month</label>
              <input type="text" placeholder="e.g., January" />
            </div>
            <div className="form-group">
              <label>Stock (kg)</label>
              <input type="number" placeholder="e.g., 1000" />
            </div>
            <div className="form-group">
              <label>Demand Index</label>
              <input type="number" placeholder="e.g., 8.5" />
            </div>
            <div className="form-group">
              <label>Storage Cost Index</label>
              <input type="number" placeholder="e.g., 2.1" />
            </div>
          </div>
          
          {/* Reddish button as per image */}
          <button type="button" className="submit-btn price-btn">{t.submit}</button>
        </form>
      </div>
    </div>
  );
}

const translations = {
  en: {
    title: 'Price Prediction',
    submit: 'Predict Price',
  },
  ta: {
    title: 'விலை கணிப்பு',
    submit: 'விலையை கணிக்கவும்',
  },
};

export default PricePredictionPage;