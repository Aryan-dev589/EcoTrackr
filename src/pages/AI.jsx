// src/pages/AI.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
// --- THIS IS THE FIX ---
// Correct path from src/pages/ to src/api/ and correct lowercase 'c'
import api from '../api/axiosconfig'; 

// --- 1. Helper component for the chat bubbles ---
const ChatBubble = ({ message, role }) => {
  const isUser = role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg px-5 py-3 rounded-2xl shadow-sm ${
          isUser
            ? 'bg-green-600 text-white rounded-br-none'
            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
        }`}
        style={{ whiteSpace: 'pre-wrap' }} // Respects newlines from the AI
      >
        {/* We just render the message content directly */}
        {message}
      </div>
    </motion.div>
  );
};

// --- 2. Main AI Coach Component ---
const AICoach = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState([]); // Will hold the chat history
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false); // Controls the "..." bubble
  
  // --- 3. State for our "Facts Engine" ---
  const [userFacts, setUserFacts] = useState(null); // Holds data from our backend
  const [proactiveTip, setProactiveTip] = useState(null); // Holds the first tip

  // --- 4. Fetch "Facts" from our backend on load ---
  useEffect(() => {
    const fetchUserFacts = async () => {
      try {
        const response = await api.get('/api/coach/insights');
        setUserFacts(response.data); // Save the facts

        // --- Create the first proactive messages ---
        const facts = response.data;
        let welcomeMsg = "Hi! I'm your EcoTrackr AI Coach 🌱. I'm here to help you reduce your carbon footprint. How can I assist you today?";
        
        // Make the first tip data-driven
        if (facts.monthlyTotal > 0) {
          let tip = `I've just reviewed your data. Your biggest hotspot this month is **${facts.hotspot.category}**, making up **${facts.hotspot.percentage}%** of your total.`;
          setProactiveTip(tip);
        } else {
          setProactiveTip("Log your first activity to get personalized insights!");
        }
        
        setMessages([{ id: 1, type: 'ai', content: welcomeMsg, timestamp: new Date() }]);

      } catch (err) {
        console.error("Failed to fetch user facts", err);
        setMessages([
          { id: 1, type: 'ai', content: "Hi! I'm your EcoCoach. I'm having a little trouble accessing your data, but you can still ask me general questions!", timestamp: new Date() }
        ]);
        setProactiveTip("Could not load your activity data right now.");
      }
    };
    fetchUserFacts();
  }, []); // The [] means this runs once when the component loads

  // Scroll to bottom when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- 5. handleSendMessage (The "Orchestrator") ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessageContent = inputMessage;
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: userMessageContent,
      timestamp: new Date()
    };

    // Add user message to state and clear input
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // --- A. Define the AI's "Personality" and "Rules" ---
    const systemPrompt = `
      You are EcoCoach, a friendly and positive AI assistant for a carbon footprint app.

      --- YOUR CORE RULES ---
      1.  **STAY ON TOPIC:** Your *only* purpose is to be an expert on sustainability. You MUST answer questions about:
          - Pollution
          - Carbon emissions (CO2e)
          - Global warming and climate change
          - The reasons for emissions (e.g., "why does beef have a high footprint?")
          - AQI (Air Quality Index) details
          - Any other environmental or eco-friendly topic.
          
      2.  **REJECT OFF-TOPIC QUESTIONS:** If the user asks about *anything* not on that list (like politics, entertainment, sports, history, personal opinions, etc.), you MUST politely decline.
          * **Your Rejection Response:** "That's an interesting question, but my real expertise is in helping you with your sustainability goals. Do you have a question about your carbon footprint or the environment I can help with?"

      --- YOUR SKILLS (YOUR TOOLS) ---
      1.  **DATA-DRIVEN TIPS (Skill 1):** When the user asks how to "reduce", "lower", or "improve" their *own score*, you MUST use the provided [USER DATA] JSON to give specific tips about their hotspots and high-impact logs.
      
      2.  **COMPENSATORY ACTIONS (Skill 2):** When the user asks how to "compensate", "offset", or "make up for" a specific log (e.g., "I just logged 66kg"), you MUST use the \`findCompensatoryActivity(amount)\` tool to get a plan from the app's database.
    `;

    // --- B. Build the Chat History for the API ---
    // We map over our state to create the format Gemini needs
    const apiHistory = messages.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    
    // Add the new user message
    apiHistory.push({
      role: 'user',
      parts: [{ text: userMessageContent }]
    });

    // --- C. Define the API "Tools" ---
    const tools = [
      {
        functionDeclarations: [
          {
            name: "findCompensatoryActivity",
            description: "Finds a list of real-world eco-friendly actions (like planting trees) from the app's database to compensate for a specific carbon amount (in kg).",
            parameters: {
              type: "OBJECT",
              properties: {
                amount: { type: "NUMBER", description: "The amount of CO2e in kg to compensate for." }
              },
              required: ["amount"]
            }
          }
        ]
      }
    ];

    // --- D. Call the Gemini API ---
    const apiKey = "AIzaSyCrkSROHkvOPGBN0OLOM-GivlwmVSG8E98"; // Leave this as-is
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        // We "prime" the AI with the user's "Facts"
        {
          role: "user",
          parts: [{ text: `This is the user's data. Use it for Skill 1. [USER DATA]: ${JSON.stringify(userFacts)}` }]
        },
        {
          role: "model",
          parts: [{ text: "Got it. I will use those facts to answer questions about the user's data." }]
        },
        ...apiHistory // The actual conversation
      ],
      tools: tools
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("API request failed");

      const result = await response.json();
      
      // Check for empty or invalid response
      if (!result.candidates || !result.candidates[0].content || !result.candidates[0].content.parts[0]) {
        throw new Error("Invalid response from AI");
      }
      
      const part = result.candidates[0].content.parts[0];

      // --- E. Handle the AI's Response (The "Orchestrator") ---
      
      // CASE 1: The AI wants to use our "Savings Tool" (Skill 2)
      if (part.functionCall) {
        const functionCall = part.functionCall;
        if (functionCall.name === 'findCompensatoryActivity') {
          const amount = functionCall.args.amount;
          
          // Call our *own* backend to get the savings plan
          const toolResponse = await api.get(`/api/coach/find-savings?amount=${amount}`);
          
          // Now, send that plan back to the AI to get a conversational response
          const finalPayload = {
            ...payload,
            contents: [ // Send the whole history again
              ...payload.contents,
              { // Add the AI's first response (the tool call)
                role: "model",
                parts: [part] 
              },
              { // Add the "answer" from our tool
                role: "function", 
                parts: [{
                  functionResponse: {
                    name: "findCompensatoryActivity",
                    response: { content: toolResponse.data }
                  }
                }]
              }
            ]
          };

          const finalResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalPayload)
          });
          
          const finalResult = await finalResponse.json();
          const aiResponseText = finalResult.candidates[0].content.parts[0].text;
          setMessages(prev => [...prev, { id: prev.length + 1, type: 'ai', content: aiResponseText, timestamp: new Date() }]);
        }
      
      // CASE 2: The AI just gave a normal text answer (Skill 1)
      } else if (part.text) {
        const aiResponseText = part.text;
        setMessages(prev => [...prev, { id: prev.length + 1, type: 'ai', content: aiResponseText, timestamp: new Date() }]);
      }

    } catch (err) {
      console.error("Error in handleSendMessage:", err);
      setMessages(prev => [...prev, { id: prev.length + 1, type: 'ai', content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.", timestamp: new Date() }]);
    }
    
    setIsTyping(false);
  };
  
  // (Helper functions from your file)
  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };
  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)' }}>
      {/* Header (Unchanged) */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/Dashboard')} // Corrected to /Dashboard
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
      
      {/* --- JSX is now fixed --- */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        
        {/* Proactive Tips Section (now uses REAL data) */}
        <div className="p-4 bg-blue-50 border-b">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-blue-800">💡 Proactive Tip</h3>
            <span className="text-xs text-blue-600">Based on your activity</span>
          </div>
          <div className="overflow-x-auto">
            <div className="flex space-x-3 pb-2">
              <div className="flex-shrink-0 bg-white rounded-lg p-3 shadow-sm border max-w-xs">
                <p className="text-sm text-gray-700">
                  {proactiveTip || "Loading your insights..."}
                </p>
              </div>
              {/* We can add more tips here later */}
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
                {/* Use the ChatBubble component for markdown rendering */}
                <ChatBubble message={message.content} role={message.type} />
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

        {/* Quick Questions (Unchanged) */}
        <div className="border-t bg-white p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Questions</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              "How can I reduce my travel emissions?",
              "What was my biggest impact this month?",
              "Suggest a way to offset 100kg.",
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

        {/* Message Input (Unchanged, but I fixed a typo in onChange) */}
        <div className="border-t bg-white p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <div className="flex-1">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask your coach anything..."
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
            Ask about your data, or for general sustainability tips.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AICoach;