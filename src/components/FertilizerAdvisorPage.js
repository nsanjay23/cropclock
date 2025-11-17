import React, { useState } from 'react';
import { useApp } from '../App';

function FertilizerAdvisorPage() {
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
    title: 'Fertilizer Advisor',
    locationLabel: 'Please enter your location for soil data:',
    locationPlaceholder: 'e.g., Thanjavur',
    submit: 'Get Advice',
    showingFor: 'Showing fertilizer advice for',
    contentPlaceholder: 'Your fertilizer advice will appear here.',
  },
  ta: {
    title: 'உர ஆலோசகர்',
    locationLabel: 'மண் தரவுகளுக்கு உங்கள் இருப்பிடத்தை உள்ளிடவும்:',
    locationPlaceholder: 'எ.கா., தஞ்சாவூர்',
    submit: 'ஆலோசனையைப் பெறுங்கள்',
    showingFor: 'உர ஆலோசனையைக் காட்டுகிறது',
    contentPlaceholder: 'உங்கள் உர ஆலோசனை இங்கே தோன்றும்.',
  },
};

export default FertilizerAdvisorPage;