import React, { useState } from 'react';
import { useApp } from '../App';

function RecommendationPage() {
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
    title: 'Smart Crop Recommendation',
    locationLabel: 'Please enter your location to get started:',
    locationPlaceholder: 'e.g., Coimbatore',
    submit: 'Get Recommendation',
    showingFor: 'Showing recommendations for',
    contentPlaceholder: 'Your crop recommendations will appear here.',
  },
  ta: {
    title: 'ஸ்மார்ட் பயிர் பரிந்துரை',
    locationLabel: 'தொடங்க, உங்கள் இருப்பிடத்தை உள்ளிடவும்:',
    locationPlaceholder: 'எ.கா., கோயம்புத்தூர்',
    submit: 'பரிந்துரையைப் பெறுங்கள்',
    showingFor: 'பரிந்துரைகளைக் காட்டுகிறது',
    contentPlaceholder: 'உங்கள் பயிர் பரிந்துரைகள் இங்கே தோன்றும்.',
  },
};

export default RecommendationPage;