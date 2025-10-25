const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');

// Initialize Gemini AI
let genAI = null;
let model = null;

if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-pro' });
} else {
  console.warn('GEMINI_API_KEY not set. Chat will use fallback responses.');
}

// Load venue data for RAG (Retrieval Augmented Generation)
let venueData = null;

async function loadVenueData() {
  try {
    const dataPath = path.join(__dirname, '../../data/venues.json');
    const data = await fs.readFile(dataPath, 'utf8');
    venueData = JSON.parse(data);
    console.log('Venue data loaded for RAG');
  } catch (error) {
    console.log('No venue data found. Using basic responses.');
    venueData = {
      venues: [],
      emergencyProcedures: {
        fire: 'In case of fire: 1) Activate nearest fire alarm 2) Evacuate calmly 3) Call 911',
        medical: 'In case of medical emergency: 1) Call 911 2) Do not move injured person 3) Wait for medical help',
        security: 'In case of security threat: 1) Alert security immediately 2) Move to safe location 3) Follow staff instructions'
      }
    };
  }
}

loadVenueData();

// Intent classification helper
function classifyIntent(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('emergency') || lowerMessage.includes('help') || lowerMessage.includes('urgent')) {
    return 'emergency';
  }
  if (lowerMessage.includes('venue') || lowerMessage.includes('location') || lowerMessage.includes('room')) {
    return 'venue_info';
  }
  if (lowerMessage.includes('book') || lowerMessage.includes('reserve') || lowerMessage.includes('schedule')) {
    return 'booking';
  }
  if (lowerMessage.includes('event') || lowerMessage.includes('calendar')) {
    return 'events';
  }
  
  return 'general';
}

// Get context for RAG
function getRelevantContext(intent, message) {
  if (!venueData) return '';
  
  let context = '';
  
  if (intent === 'emergency') {
    context = `Emergency Procedures:\n${JSON.stringify(venueData.emergencyProcedures, null, 2)}\n`;
  } else if (intent === 'venue_info' && venueData.venues) {
    context = `Available Venues:\n${JSON.stringify(venueData.venues, null, 2)}\n`;
  }
  
  return context;
}

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Classify intent
    const intent = classifyIntent(message);
    const context = getRelevantContext(intent, message);

    let reply = '';

    if (model && process.env.GEMINI_API_KEY) {
      // Use Gemini AI with RAG context
      const prompt = `You are VenueGenie, an AI assistant for venue management. 
Context: ${context}

User's question: ${message}

Provide a helpful, concise response. If this is about emergencies, prioritize safety information.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      reply = response.text();
    } else {
      // Fallback responses
      switch (intent) {
        case 'emergency':
          reply = `⚠️ For any emergency:\n\n${venueData.emergencyProcedures.fire}\n\nPlease use the dashboard to report emergencies immediately.`;
          break;
        case 'venue_info':
          reply = `I can help you with venue information. Our facilities include multiple event spaces. Please check the dashboard for detailed venue information.`;
          break;
        case 'booking':
          reply = `To book a venue, please contact our booking team or use the dashboard booking system. I'm here to answer any questions about our venues!`;
          break;
        default:
          reply = `I'm VenueGenie, your venue management assistant. I can help with:\n- Venue information\n- Emergency procedures\n- Event booking\n- General assistance\n\nHow can I help you today?`;
      }
    }

    res.json({ 
      reply,
      intent,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      reply: 'I apologize, but I encountered an error. Please try again.'
    });
  }
});

module.exports = router;
