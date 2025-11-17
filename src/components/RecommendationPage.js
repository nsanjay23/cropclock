import React, { useState, useEffect } from 'react';
import { useApp } from '../App';

function RecommendationPage() {
  const { language } = useApp();
  
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

  const [isLoading, setIsLoading] = useState(true);
  const [manualLoading, setManualLoading] = useState(false);
  
  // NEW: State for the prediction result
  const [prediction, setPrediction] = useState(null);

  // 1. Automatic GPS Location (Existing Code)
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

  // Helper: Fetch Weather (Existing Code)
  const fetchWeatherByCoords = async (lat, long, locationName = null) => {
    try {
      let finalLocationName = locationName;
      if (!finalLocationName) {
        const locationResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}`);
        const locationData = await locationResponse.json();
        const address = locationData.address;
        finalLocationName = address.village || address.town || address.city || address.county || "Unknown Location";
      }

      const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,relative_humidity_2m,rain`);
      const weatherData = await weatherResponse.json();
      const current = weatherData.current;

      setFormData(prev => ({
        ...prev,
        location: finalLocationName,
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        rainfall: current.rain,
      }));
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  };

  // Manual "Get Weather" (Existing Code)
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
      alert("Error fetching weather data.");
    }
    setManualLoading(false);
  };

  // NEW: Handle Prediction (Connect to Backend)
  const handlePredict = async () => {
    // Basic validation
    if (!formData.nitrogen || !formData.phosphorus || !formData.potassium) {
      alert("Please fill in N, P, and K values.");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.prediction) {
        setPrediction(result.prediction);
      } else {
        alert("Error predicting: " + result.error);
      }
    } catch (error) {
      console.error("Error connecting to backend:", error);
      alert("Could not connect to the prediction server.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const t = translations[language];

  return (
    <div className="feature-page">
      <h2>{t.title}</h2>
      
      <div className="form-container">
        <form>
          <div className="form-grid">
            
            {/* Location Input + Button */}
            <div className="form-group" style={{gridColumn: '1 / -1'}}>
              <label>Location (Village / City)</label>
              <div style={{display: 'flex', gap: '10px'}}>
                <input 
                  type="text" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  placeholder={isLoading ? "Detecting location..." : "Enter city name"} 
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

            <div className="form-group">
              <label>Nitrogen (N)</label>
              <input type="number" name="nitrogen" value={formData.nitrogen} onChange={handleChange} placeholder="e.g., 90" />
            </div>
            <div className="form-group">
              <label>Phosphorus (P)</label>
              <input type="number" name="phosphorus" value={formData.phosphorus} onChange={handleChange} placeholder="e.g., 42" />
            </div>
            <div className="form-group">
              <label>Potassium (K)</label>
              <input type="number" name="potassium" value={formData.potassium} onChange={handleChange} placeholder="e.g., 43" />
            </div>
            <div className="form-group">
              <label>pH Level</label>
              <input type="number" name="ph" value={formData.ph} onChange={handleChange} placeholder="e.g., 6.5" />
            </div>
            
            <div className="form-group">
              <label>Temperature (°C)</label>
              <input type="number" name="temperature" value={formData.temperature} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Humidity (%)</label>
              <input type="number" name="humidity" value={formData.humidity} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Rainfall (mm)</label>
              <input type="number" name="rainfall" value={formData.rainfall} onChange={handleChange} />
            </div>
          </div>
          
          {/* NEW: Prediction Button calls handlePredict */}
          <button type="button" onClick={handlePredict} className="submit-btn">{t.submit}</button>
        </form>

        {/* NEW: Display the Result */}
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
  en: {
    title: 'AI Smart Farmer Assistant',
    submit: 'Predict Crop',
  },
  ta: {
    title: 'AI ஸ்மார்ட் விவசாயி உதவியாளர்',
    submit: 'பயிரை கணிக்கவும்',
  },
};

export default RecommendationPage;