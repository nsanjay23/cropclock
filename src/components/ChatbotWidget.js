import React, { useState } from 'react';
import { useApp } from '../App';

function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useApp();
  const t = translations[language];

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="chatbot-widget">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            {t.title}
          </div>
          <div className="chat-body">
            <p>{t.welcome}</p>
          </div>
          <div className="chat-input">
            <input type="text" placeholder={t.placeholder} />
            <button>{t.send}</button>
          </div>
        </div>
      )}
      <div className="chatbot-icon" onClick={toggleChat}>
        {isOpen ? 'X' : t.icon}
      </div>
    </div>
  );
}

const translations = {
  en: {
    title: 'AI Chatbot',
    welcome: 'Hi! How can I help you today?',
    placeholder: 'Type a message...',
    send: 'Send',
    icon: 'Chat'
  },
  ta: {
    title: 'AI சாட்பாட்',
    welcome: 'வணக்கம்! இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?',
    placeholder: 'செய்தியை தட்டச்சு செய்யவும்...',
    send: 'அனுப்பு',
    icon: 'உரை'
  },
};

export default ChatbotWidget;