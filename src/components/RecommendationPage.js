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
  const [suggestions, setSuggestions] = useState([]); 
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // We use this state to track what the user is *actively* typing
  const [searchTerm, setSearchTerm] = useState(''); 

  // 1. Automatic GPS Location on Load
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

  // 2. OPTIMIZED AUTOCOMPLETE LOGIC
  useEffect(() => {
    // If search term is too short, don't search
    if (searchTerm.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // "Debounce" logic: Wait 500ms after user stops typing
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchTerm}&addressdetails=1&limit=5`);
        const results = await response.json();
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    }, 500); // Reduced from 1000ms to 500ms for snappier feel

    // Cleanup function: If user types again, cancel the previous timer
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Helper: Fetch Weather using Lat/Long
  const fetchWeatherByCoords = async (lat, long, locationName = null) => {
    try {
      let finalLocationName = locationName;
      if (!finalLocationName) {
        const locationResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}`);
        const locationData = await locationResponse.json();
        const address = locationData.address;
        finalLocationName = address.village || address.town || address.city || address.county || "Unknown Location";
      }

      // Update the input field with the found name
      setFormData(prev => ({ ...prev, location: finalLocationName }));
      setSearchTerm(finalLocationName); // Sync search term so dropdown doesn't pop up again unnecessarily

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

  // Handle user typing
  const handleLocationInput = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, location: value });
    setSearchTerm(value); // Triggers the useEffect above
  };

  // Handle clicking a suggestion
  const selectSuggestion = (place) => {
    setShowSuggestions(false);
    // Fetch weather immediately
    fetchWeatherByCoords(place.lat, place.lon, place.display_name.split(',')[0]);
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
            
            {/* Location Input with Autocomplete */}
            <div className="form-group" style={{gridColumn: '1 / -1'}}>
              <label>Location (Village / City)</label>
              <div className="autocomplete-wrapper">
                <input 
                  type="text" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleLocationInput} 
                  placeholder={isLoading ? "Detecting location..." : "Type to search (e.g. Madurai)..."} 
                  autoComplete="off"
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="suggestions-list">
                    {suggestions.map((place) => (
                      <li key={place.place_id} onClick={() => selectSuggestion(place)}>
                        {place.display_name}
                      </li>
                    ))}
                  </ul>
                )}
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
            
            {/* Weather Data */}
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
          
          <button type="button" className="submit-btn">{t.submit}</button>
        </form>
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