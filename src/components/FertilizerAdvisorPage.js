import React, { useState, useEffect } from 'react';
import { useApp } from '../App';

// IMPORTANT: Replace this with your new Render URL
const API_URL = "https://cropclock-backend.onrender.com";

function FertilizerAdvisorPage() {
  const { language, sharedNPK, setSharedNPK } = useApp();
  const t = translations[language];

  const [formData, setFormData] = useState({
    location: '',
    temperature: '',
    humidity: '',
    moisture: '',
    nitrogen: sharedNPK.nitrogen || '',
    potassium: sharedNPK.potassium || '',
    phosphorus: sharedNPK.phosphorus || '',
    soil: '',
    crop: ''
  });
  
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [manualLoading, setManualLoading] = useState(false);
  
  const soilTypes = ['Clay', 'Sandy', 'Loamy', 'Black', 'Red'];
  const crops = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane'];

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      nitrogen: sharedNPK.nitrogen,
      potassium: sharedNPK.potassium,
      phosphorus: sharedNPK.phosphorus
    }));
  }, [sharedNPK]);

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

      const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,relative_humidity_2m`);
      const weatherData = await weatherResponse.json();
      const current = weatherData.current;

      setFormData(prev => ({
        ...prev,
        location: finalLocationName,
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'nitrogen' || name === 'potassium' || name === 'phosphorus') {
      setSharedNPK(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    if(!formData.soil || !formData.crop) {
      alert("Please select Soil and Crop type.");
      return;
    }
    try {
      // --- UPDATED URL ---
      const response = await fetch(`${API_URL}/predict_fertilizer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Temperature: formData.temperature,
          Humidity: formData.humidity,
          Soil_Moisture: formData.moisture,
          Soil_Type: formData.soil,
          Crop_Type: formData.crop,
          Nitrogen: formData.nitrogen,
          Potassium: formData.potassium,
          Phosphorus: formData.phosphorus
        }),
      });
      const result = await response.json();
      if (result.Recommended_Fertilizer) setPrediction(result.Recommended_Fertilizer);
      else alert("Error: " + result.error);
    } catch (error) { 
      alert("Backend not connected");
    }
  };

  return (
    <div className="feature-page">
      <h2>{t.title}</h2>
      
      <div className="form-container">
        <div className="form-section-title">🌦 Live Weather</div>

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
                  style={{
                    backgroundColor: '#388E3C',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0 20px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {manualLoading ? "Loading..." : "Get Weather"}
                </button>
            </div>
        </div>
        
        <div className="form-section-title">🌿 Fertilizer Recommendation</div>

        <form onSubmit={handlePredict}>
          <div className="form-grid">
            <div className="form-group">
              <label>Temperature (°C)</label>
              <input type="number" name="temperature" value={formData.temperature} onChange={handleChange} placeholder="Auto-filled" required />
            </div>
            <div className="form-group">
              <label>Humidity (%)</label>
              <input type="number" name="humidity" value={formData.humidity} onChange={handleChange} placeholder="Auto-filled" required />
            </div>
            <div className="form-group">
              <label>Soil Moisture</label>
              <select name="moisture" value={formData.moisture} onChange={handleChange} required>
                <option value="">Select Moisture Level</option>
                <option value="20">Dry</option>
                <option value="50">Moist</option>
                <option value="80">Wet</option>
              </select>
            </div>

            <div className="form-group">
              <label>Nitrogen (N)</label>
              <input type="number" name="nitrogen" value={formData.nitrogen} onChange={handleChange} placeholder="Auto-filled" required />
            </div>
            <div className="form-group">
              <label>Potassium (K)</label>
              <input type="number" name="potassium" value={formData.potassium} onChange={handleChange} placeholder="Auto-filled" required />
            </div>
            <div className="form-group">
              <label>Phosphorus (P)</label>
              <input type="number" name="phosphorus" value={formData.phosphorus} onChange={handleChange} placeholder="Auto-filled" required />
            </div>
            
            <div className="form-group">
              <label>Select Soil Type</label>
              <select name="soil" value={formData.soil} onChange={handleChange} required>
                <option value="">-- Select Soil --</option>
                {soilTypes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Select Crop</label>
              <select name="crop" value={formData.crop} onChange={handleChange} required>
                <option value="">-- Select Crop --</option>
                {crops.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          
          <button type="submit" className="submit-btn advisor-btn">{t.submit}</button>
        </form>

        {prediction && (
          <div style={{marginTop: '2rem', padding: '1.5rem', backgroundColor: '#e3f2fd', border: '2px solid #1565c0', borderRadius: '12px', textAlign: 'center'}}>
            <h3 style={{margin: 0, color: '#0d47a1'}}>Recommended Fertilizer:</h3>
            <div style={{fontSize: '2.5rem', fontWeight: 'bold', color: '#1565c0', marginTop: '0.5rem', textTransform: 'uppercase'}}>
              {prediction}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
const translations = {
  en: { title: 'Fertilizer Advisor', submit: 'Recommend Fertilizer' },
  ta: { title: 'உர ஆலோசகர்', submit: 'உரத்தை பரிந்துரைக்கவும்' },
};
export default FertilizerAdvisorPage;