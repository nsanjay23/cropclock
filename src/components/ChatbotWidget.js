import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../App';

function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useApp();
  const t = translations[language];

  // New states for the chat
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'ai', text: t.welcome }
  ]);
  
  // Ref to scroll to bottom
  const chatBodyRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages appear
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { from: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send message to your new backend route
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      if (data.reply) {
        setMessages(prev => [...prev, { from: 'ai', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { from: 'ai', text: t.error }]);
      }
      
    } catch (error) {
      console.error("Error connecting to chat backend:", error);
      setMessages(prev => [...prev, { from: 'ai', text: t.error }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="chatbot-widget">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            {t.title}
          </div>
          
          <div className="chat-body" ref={chatBodyRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`message-bubble ${msg.from}-message`}>
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="message-bubble ai-message">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>
          
          <form className="chat-input" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder={t.placeholder} 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>{t.send}</button>
          </form>
        </div>
      )}
      <div className="chatbot-icon" onClick={toggleChat}>
        {isOpen ? '✕' : 'Chat'}
      </div>
    </div>
  );
}

const translations = {
  en: {
    title: 'CropClock AI',
    welcome: 'Hi! How can I help you today?',
    placeholder: 'Type a message...',
    send: 'Send',
    icon: 'Chat',
    error: 'Sorry, I am having trouble connecting. Please try again later.'
  },
  ta: {
    title: 'கிராப்க்ளாக் AI',
    welcome: 'வணக்கம்! இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?',
    placeholder: 'செய்தியை தட்டச்சு செய்யவும்...',
    send: 'அனுப்பு',
    icon: 'உரை',
    error: 'மன்னிக்கவும், என்னால் இணைக்க முடியவில்லை. பின்னர் முயற்சிக்கவும்.'
  },
};

export default ChatbotWidget;