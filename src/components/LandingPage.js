import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../App'; // Still needed

// The features object remains the same
const features = {
  en: [
    {
      name: 'Smart Crop Recommendation',
      path: '/recommendation',
      description: 'Get AI-powered recommendations for the best crops to plant.',
    },
    {
      name: 'Price Prediction',
      path: '/price',
      description: 'Forecast market prices for your crops to sell at the best time.',
    },
    {
      name: 'Fertilizer Advisor',
      path: '/fertilizer',
      description: 'Receive advice on the right fertilizer type and quantity.',
    },
  ],
  ta: [
    {
      name: 'ஸ்மார்ட் பயிர் பரிந்துரை',
      path: '/recommendation',
      description: 'பயிரிட சிறந்த பயிர்களுக்கான AI-இயங்கும் பரிந்துரைகளைப் பெறுங்கள்.',
    },
    {
      name: 'விலை கணிப்பு',
      path: '/price',
      description: 'சிறந்த நேரத்தில் விற்க உங்கள் பயிர்களுக்கான சந்தை விலைகளைக் கணிக்கவும்.',
    },
    {
      name: 'உர ஆலோசகர்',
      path: '/fertilizer',
      description: 'சரியான உர வகை மற்றும் அளவு குறித்த ஆலோசனைகளைப் பெறுங்கள்.',
    },
  ],
};

function LandingPage() {
  // We only need to get the language, not set it
  const { language } = useApp();
  const currentFeatures = features[language];

  return (
    <div className="landing-page">
      
      {/* The language-selector div has been removed from here */}

      <div className="feature-grid">
        {currentFeatures.map((feature) => (
          <Link to={feature.path} key={feature.name} className="feature-card">
            <h3>{feature.name}</h3>
            <p>{feature.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// The 'translations' object has been removed

export default LandingPage;