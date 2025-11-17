import React, { useState, useEffect } from 'react';
import { useApp } from '../App';

// IMPORTANT: Replace this with your new Render URL
const API_URL = "https://cropclock-backend.onrender.com";

function RecommendationPage() {
  const { language, setSharedNPK } = useApp();
  const t = translations[language];
  
  const [formData, setFormData] = useState({
    location: '', 
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: ''
  });

  const [npkData, setNpkData] = useState({
    soil_type: '',
    prev_crop: '',
    yield_level: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [manualLoading, setManualLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const npkSoilTypes = ["Loamy", "Sandy", "Clay", "Silty", "Red Soil", "Black Soil", "Alluvial", "Laterite"];
  const npkPrevCrops = ["Rice", "Wheat", "Maize", "Cotton", "Sugarcane", "Groundnut", "Soybean", "Pulses", "Millets", "Vegetables", "Sunflower", "Chillies"];
  const npkYields = ["High", "Medium", "Low"];

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const long = position.coords.longitude;
          await fetchWeatherByCoords(lat, long);
          setIsLoading(false);
        },
        (error) => {
          console.log("GPS denied");
          setIsLoading(false);
        }
      );
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchWeatherByCoords = async (lat, long, locationName = null) => {
    try {
      let finalLocationName = locationName;
      if (!finalLocationName) {
        const locationResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}`);
        const locationData = await locationResponse.json();
        const address = locationData.address;
        finalLocationName = address.village || address.town || address.city || address.county || "Unknown Location";
      }

      const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,relative_humidity_2m,precipitation`);
      const weatherData = await weatherResponse.json();
      const current = weatherData.current;

      setFormData(prev => ({
        ...prev,
        location: finalLocationName,
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        rainfall: current.precipitation,
      }));
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  };

  const handleManualWeatherFetch = async () => {
    if (!formData.location) return;
    setManualLoading(true);
    try {
      const searchResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${formData.location}`);
      const searchData = await searchResponse.json();
      if (searchData && searchData.length > 0) {
        const lat = searchData[0].lat;
        const lon = searchData[0].lon;
        const displayName = searchData[0].display_name.split(',')[0];
        await fetchWeatherByCoords(lat, lon, displayName);
      } else {
        alert("Location not found.");
      }
    } catch (error) {
      alert("Error fetching data.");
    }
    setManualLoading(false);
  };

  const handlePredictNPK = async () => {
    if (formData.temperature === "" || formData.humidity === "" || formData.rainfall === "") {
      alert("Please get Weather data first (GPS or Manual)!");
      return;
    }
    if (!npkData.soil_type || !npkData.prev_crop || !npkData.yield_level) {
      alert("Please select Soil Type, Previous Crop, and Yield Level.");
      return;
    }

    try {
      // --- UPDATED URL ---
      const response = await fetch(`${API_URL}/predict_npk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soil_type: npkData.soil_type,
          prev_crop: npkData.prev_crop,
          yield_level: npkData.yield_level,
          tempC: formData.temperature,
          humidity: formData.humidity,
          rainfall: formData.rainfall
        }),
      });

      const result = await response.json();

      if (result.N !== undefined) {
        setFormData(prev => ({
          ...prev,
          nitrogen: result.N,
          phosphorus: result.P,
          potassium: result.K
        }));
        setSharedNPK({
          nitrogen: result.N,
          phosphorus: result.P,
          potassium: result.K
        });
        alert("✅ NPK values predicted and auto-filled!");
      } else {
        alert("Error predicting NPK: " + result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Could not connect to NPK predictor.");
    }
  };

  const handlePredictCrop = async (e) => {
    e.preventDefault();
    if (!formData.nitrogen || !formData.phosphorus || !formData.potassium) {
      alert("Please fill in N, P, and K values (or use NPK Predictor).");
      return;
    }

    try {
      // --- UPDATED URL ---
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          N: formData.nitrogen,
          P: formData.phosphorus,
          K: formData.potassium,
          temperature: formData.temperature,
          humidity: formData.humidity,
          ph: formData.ph,
          rainfall: formData.rainfall
        }),
      });
      const result = await response.json();
      if (result.crop) setPrediction(result.crop);
      else alert("Error: " + result.error);
    } catch (error) {
      alert("Backend not connected");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'nitrogen' || name === 'phosphorus' || name === 'potassium') {
      setSharedNPK(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="feature-page">
      <h2>{t.title}</h2>
      <div className="form-container">
        
        <div className="form-section-title">1. Get Local Weather</div>
        <div className="form-group" style={{marginBottom: '1.5rem'}}>
          <label>Location (Village / City)</label>
          <div style={{display: 'flex', gap: '10px'}}>
            <input 
              type="text" 
              name="location" 
              value={formData.location} 
              onChange={handleChange} 
              placeholder={isLoading ? "Detecting GPS..." : "Enter city name"} 
              style={{flexGrow: 1}}
            />
            <button 
              type="button" 
              onClick={handleManualWeatherFetch}
              style={{backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', padding: '0 20px', cursor: 'pointer', fontWeight: 'bold'}}
            >
              {manualLoading ? "..." : "Get Weather"}
            </button>
          </div>
        </div>

        <div className="form-section-title" style={{marginTop: '2rem', color: '#7c3aed', borderBottomColor: '#ddd6fe'}}>
          2. Smart NPK Predictor (Optional)
        </div>
        <div style={{backgroundColor: '#f5f3ff', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem'}}>
          <p style={{fontSize: '0.9rem', color: '#666', marginTop: 0}}>
            Don't know your soil's N-P-K values? We can estimate them.
          </p>
          <div className="form-grid">
            <div className="form-group">
              <label>Soil Type</label>
              <select value={npkData.soil_type} onChange={(e) => setNpkData({...npkData, soil_type: e.target.value})}>
                <option value="">Select Soil Type</option>
                {npkSoilTypes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Previous Crop</label>
              <select value={npkData.prev_crop} onChange={(e) => setNpkData({...npkData, prev_crop: e.target.value})}>
                <option value="">Select Previous Crop</option>
                {npkPrevCrops.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Yield Level</label>
              <select value={npkData.yield_level} onChange={(e) => setNpkData({...npkData, yield_level: e.target.value})}>
                <option value="">Select Yield</option>
                {npkYields.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <button 
            type="button" 
            onClick={handlePredictNPK} 
            className="submit-btn"
            style={{backgroundColor: '#7c3aed', marginTop: '10px'}}
          >
            🔍 Predict & Auto-Fill NPK
          </button>
        </div>

        <div className="form-section-title">3. Crop Recommendation Inputs</div>
        <form onSubmit={handlePredictCrop}>
          <div className="form-grid">
            <div className="form-group">
              <label>Nitrogen (N)</label>
              <input type="number" name="nitrogen" value={formData.nitrogen} onChange={handleChange} placeholder="Auto-filled or Manual" required />
            </div>
            <div className="form-group">
              <label>Phosphorus (P)</label>
              <input type="number" name="phosphorus" value={formData.phosphorus} onChange={handleChange} placeholder="Auto-filled or Manual" required />
            </div>
            <div className="form-group">
              <label>Potassium (K)</label>
              <input type="number" name="potassium" value={formData.potassium} onChange={handleChange} placeholder="Auto-filled or Manual" required />
            </div>
            <div className="form-group">
              <label>pH Level</label>
              <input type="number" name="ph" value={formData.ph} onChange={handleChange} placeholder="e.g., 6.5" required />
            </div>
            <div className="form-group">
              <label>Temperature (°C)</label>
              <input type="number" name="temperature" value={formData.temperature} onChange={handleChange} placeholder="Auto-filled" required />
            </div>
            <div className="form-group">
              <label>Humidity (%)</label>
              <input type="number" name="humidity" value={formData.humidity} onChange={handleChange} placeholder="Auto-filled" required />
            </div>
            <div className="form-group">
              <label>Rainfall (mm)</label>
              <input type="number" name="rainfall" value={formData.rainfall} onChange={handleChange} placeholder="Auto-filled" required />
            </div>
          </div>
          <button type="submit" className="submit-btn">{t.submit}</button>
        </form>

        {prediction && (
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            backgroundColor: '#e8f5e9',
            border: '2px solid #4CAF50',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3 style={{margin: 0, color: '#2E7D32'}}>Recommended Crop:</h3>
            <div style={{fontSize: '2.5rem', fontWeight: 'bold', color: '#1B5E20', marginTop: '0.5rem', textTransform: 'capitalize'}}>
              {prediction}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
const translations = {
  en: { title: 'AI Smart Farmer Assistant', submit: 'Predict Crop' },
  ta: { title: 'AI ஸ்மார்ட் விவசாயி உதவியாளர்', submit: 'பயிரை கணிக்கவும்' },
};
export default RecommendationPage;