import React, { useState } from 'react';
import { useApp } from '../App';

function PricePredictionPage() {
  const t = translations['en'];
  
  const [price, setPrice] = useState({
    State:"", Crop:"", Season:"", Month:"", Stock_kg:"", Demand_Index:"", Storage_Cost_Index:""
  });
  const [priceRes, setPriceRes] = useState(null);

  const handlePrice = e => setPrice({...price, [e.target.name]:e.target.value});

  const submitPrice = async e => {
    e.preventDefault();
    const res = await fetch("http://127.0.0.1:5000/predict_price", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(price)
    });
    const data = await res.json();
    setPriceRes(data);
  };

  return (
    <div className="feature-page">
      <h2>{t.title}</h2>
      
      <div className="form-container">
        <div className="form-section-title">💰 Price Prediction</div>
        <form onSubmit={submitPrice}>
          <div className="form-grid">
            <div className="form-group">
              <label>Select State</label>
              <select name="State" value={price.State} onChange={handlePrice} required>
                <option value="">Select State</option>
                <option>Andhra Pradesh</option>
                <option>Telangana</option>
                <option>Karnataka</option>
                <option>Tamil Nadu</option>
                <option>Maharashtra</option>
              </select>
            </div>
            <div className="form-group">
              <label>Select Crop</label>
              <select name="Crop" value={price.Crop} onChange={handlePrice} required>
                <option value="">Select Crop</option>
                <option>Rice</option><option>Wheat</option><option>Maize</option>
                <option>Cotton</option><option>Sugarcane</option>
                <option>Groundnut</option><option>Soybean</option>
              </select>
            </div>
            <div className="form-group">
              <label>Select Season</label>
              <select name="Season" value={price.Season} onChange={handlePrice} required>
                <option value="">Season</option>
                <option>Kharif</option><option>Rabi</option>
                <option>Summer</option><option>Whole Year</option>
                <option>Post-Monsoon</option>
              </select>
            </div>
            <div className="form-group">
              <label>Month (1-12)</label>
              <input name="Month" placeholder="Month (1-12)" value={price.Month} required onChange={handlePrice} />
            </div>
            <div className="form-group">
              <label>Stock (kg)</label>
              <input name="Stock_kg" placeholder="Stock (Kg)" value={price.Stock_kg} required onChange={handlePrice} />
            </div>
            <div className="form-group">
              <label>Demand</label>
              <select name="Demand_Index" value={price.Demand_Index} required onChange={handlePrice}>
                <option value="">Demand</option>
                <option value="3">Low</option>
                <option value="6">Medium</option>
                <option value="9">High</option>
              </select>
            </div>
            <div className="form-group">
              <label>Storage Cost</label>
              <select name="Storage_Cost_Index" value={price.Storage_Cost_Index} required onChange={handlePrice}>
                <option value="">Storage Cost</option>
                <option value="3">Low</option>
                <option value="6">Medium</option>
                <option value="9">High</option>
              </select>
            </div>
          </div>
          <button type="submit" className="submit-btn price-btn">{t.submit}</button>
        </form>
        {priceRes && (
          <div style={{marginTop: '2rem', padding: '1.5rem', backgroundColor: '#ffebee', border: '2px solid #c62828', borderRadius: '12px', textAlign: 'left'}}>
            <h3 style={{margin: '0 0 1rem 0', color: '#b71c1c', borderBottom: '1px solid #ffcdd2', paddingBottom: '0.5rem'}}>Prediction Result:</h3>
            <p><strong>₹ Price per Quintal:</strong> {priceRes.price_per_quintal}</p>
            <p><strong>₹ Price per Kg:</strong> {priceRes.price_per_kg}</p>
            <p><strong>💰 Estimated Total Value:</strong> ₹{priceRes.total_value}</p>
            <h4 style={{marginTop: '1rem'}}>📢 Market Advice: {priceRes.recommendation}</h4>
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