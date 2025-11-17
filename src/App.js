import React, { useState, createContext, useContext } from 'react';
// Import Link here
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'; 
import './App.css';

import LandingPage from './components/LandingPage';
import RecommendationPage from './components/RecommendationPage';
import PricePredictionPage from './components/PricePredictionPage';
import FertilizerAdvisorPage from './components/FertilizerAdvisorPage';
import ChatbotWidget from './components/ChatbotWidget';

export const AppContext = createContext();
export const useApp = () => useContext(AppContext);

function App() {
  const [language, setLanguage] = useState('en');
  const [location, setLocation] = useState('');

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <AppContext.Provider value={{ language, setLanguage, location, setLocation }}>
      <BrowserRouter>
        <div className="App">
          <nav className="navbar">
            
            {/* Wrap the text in a Link component */}
            <Link to="/" className="navbar-brand">CropClock</Link>
            
            <div className="navbar-language-selector">
              <label htmlFor="language-select">Language:</label>
              <select
                id="language-select"
                value={language}
                onChange={handleLanguageChange}
              >
                <option value="en">English</option>
                <option value="ta">Tamil (தமிழ்)</option>
              </select>
            </div>
          </nav>
          
          <div className="container">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/recommendation" element={<RecommendationPage />} />
              <Route path="/price" element={<PricePredictionPage />} />
              <Route path="/fertilizer" element={<FertilizerAdvisorPage />} />
            </Routes>
          </div>
          <ChatbotWidget />
        </div>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;