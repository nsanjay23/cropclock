import React, { useState } from 'react';
import { useApp } from '../App';

function PricePredictionPage() {
  const { language, location, setLocation } = useApp();
  const [tempLocation, setTempLocation] = useState('');

  const t = translations[language];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tempLocation) {
      setLocation(tempLocation);
    }
  };

  if (!location) {
    return (
      <div className="feature-page">
        <h2>{t.title}</h2>
        <form className="location-form" onSubmit={handleSubmit}>
          <label htmlFor="location">{t.locationLabel}</label>
          <input
            type="text"
            id="location"
            value={tempLocation}
            onChange={(e) => setTempLocation(e.target.value)}
            placeholder={t.locationPlaceholder}
          />
          <button type="submit">{t.submit}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="feature-page">
      <h2>{t.title}</h2>
      <p>
        {t.showingFor}: <strong>{location}</strong>
      </p>
      <div className="feature-content-placeholder">
        <p>{t.contentPlaceholder}</p>
      </div>
    </div>
  );
}

const translations = {
  en: {
    title: 'Price Prediction',
    locationLabel: 'Please enter your location for local market data:',
    locationPlaceholder: 'e.g., Madurai',
    submit: 'Get Predictions',
    showingFor: 'Showing price predictions for',
    contentPlaceholder: 'Your price predictions will appear here.',
  },
  ta: {
    title: 'விலை கணிப்பு',
    locationLabel: 'உள்ளூர் சந்தைத் தரவுகளுக்கு உங்கள் இருப்பிடத்தை உள்ளிடவும்:',
    locationPlaceholder: 'எ.கா., மதுரை',
    submit: 'கணிப்புகளைப் பெறுங்கள்',
    showingFor: 'விலை கணிப்புகளைக் காட்டுகிறது',
    contentPlaceholder: 'உங்கள் விலை கணிப்புகள் இங்கே தோன்றும்.',
  },
};

export default PricePredictionPage;