// src/pages/AICoach.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AICoach = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hi! I'm your EcoTrackr AI Coach 🌱. I'm here to help you reduce your carbon footprint and make sustainable choices. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Sample proactive tips based on user data
  const proactiveTips = [
    "I noticed your travel emissions are higher this week. Consider carpooling or using public transport for your daily commute.",
    "Your food emissions look great! Your shift to more plant-based meals is saving ~15kg CO₂e per week.",
    "Based on your energy usage, switching to LED bulbs could save you 2kg CO₂e monthly.",
    "Your recent purchase of a smartphone added 55kg to your footprint. Consider keeping devices longer next time!"
  ];

  // Common questions and AI responses
  const commonResponses = {
    'travel': "For travel, consider:\n• Using public transport (saves ~2kg per commute)\n• Carpooling with colleagues\n• Cycling for short distances\n• Combining errands into one trip",
    'food': "For food emissions:\n• Choose plant-based options more often\n• Reduce food waste by planning meals\n• Buy local and seasonal produce\n• Cook efficiently with lid on pots",
    'shopping': "For sustainable shopping:\n• Buy quality items that last longer\n• Choose second-hand when possible\n• Support eco-friendly brands\n• Avoid impulse purchases",
    'energy': "To reduce energy use:\n• Unplug devices when not in use\n• Use smart power strips\n• Lower thermostat by 1°C\n• Wash clothes in cold water",
    'tips': "Quick sustainability tips:\n• Use reusable water bottles\n• Bring your own shopping bags\n• Fix leaks promptly\n• Air dry clothes when possible",
    'footprint': "Your carbon footprint is the total greenhouse gases caused by your activities. We track travel, food, shopping, and energy to give you a complete picture!"
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response after delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      const aiMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    // Check for keywords and return appropriate response
    if (input.includes('travel') || input.includes('commute') || input.includes('car')) {
      return commonResponses.travel;
    } else if (input.includes('food') || input.includes('meal') || input.includes('eat')) {
      return commonResponses.food;
    } else if (input.includes('shop') || input.includes('buy') || input.includes('purchase')) {
      return commonResponses.shopping;
    } else if (input.includes('energy') || input.includes('electric') || input.includes('power')) {
      return commonResponses.energy;
    } else if (input.includes('tip') || input.includes('advice') || input.includes('suggest')) {
      return commonResponses.tips;
    } else if (input.includes('footprint') || input.includes('carbon') || input.includes('emission')) {
      return commonResponses.footprint;
    } else if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello! I'm here to help you with your sustainability journey. Ask me about reducing your carbon footprint, eco-friendly habits, or anything else!";
    } else {
      return "That's an interesting question! While I'm focused on helping you reduce your carbon footprint, I'd be happy to discuss sustainable alternatives or eco-friendly practices related to your query. Could you tell me more about how this connects to environmental impact?";
    }
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
  <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)' }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">AI Coach</h1>
                <p className="text-sm text-gray-600">Your personal sustainability assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700 font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Proactive Tips Section */}
        <div className="p-4 bg-blue-50 border-b">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-blue-800">💡 Proactive Tips</h3>
            <span className="text-xs text-blue-600">Based on your activity</span>
          </div>
          <div className="overflow-x-auto">
            <div className="flex space-x-3 pb-2">
              {proactiveTips.map((tip, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 bg-white rounded-lg p-3 shadow-sm border max-w-xs"
                >
                  <p className="text-sm text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-green-500 text-white rounded-br-none'
                    : 'bg-white border border-gray-200 rounded-bl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div
                  className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-green-100' : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        <div className="border-t bg-white p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Questions</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              "How can I reduce travel emissions?",
              "Best tips for food footprint?",
              "Sustainable shopping advice?",
              "What's carbon footprint?"
            ].map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="border-t bg-white p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <div className="flex-1">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me about reducing your carbon footprint..."
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isTyping}
              />
            </div>
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className={`px-6 py-3 rounded-full font-medium transition-colors ${
                inputMessage.trim() && !isTyping
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
          <p className="text-xs text-gray-500 text-center mt-2">
            Ask about travel, food, shopping, energy, or general sustainability tips
          </p>
        </div>
      </div>
    </div>
  );
};

export default AICoach;