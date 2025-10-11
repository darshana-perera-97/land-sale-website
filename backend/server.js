require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here', // Replace with your actual API key
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`🌐 [${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ChatGPT Integration Function
async function getChatGPTResponse(userMessage, sessionId) {
  try {
    console.log(`   🤖 Calling ChatGPT API for: "${userMessage}"`);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a real estate chatbot assistant. Provide SHORT, SIMPLE answers (1-2 sentences max). Be helpful but brief. Always offer to connect with agents or schedule viewings when relevant.

AVAILABLE PROPERTIES:

LAND PROPERTIES:
1. Dubai Hills Estate Land - AED 2,500,000 (20% discount) - Keywords: luxury, golf, family - Prime location with golf course views
2. Business Bay Plot - AED 1,800,000 (15% discount) - Keywords: commercial, downtown, investment - Commercial development opportunity
3. Jumeirah Village Land - AED 1,200,000 (25% discount) - Keywords: residential, affordable, growth - Upcoming residential area
4. Dubai Marina Plot - AED 3,200,000 (10% discount) - Keywords: waterfront, luxury, premium - Waterfront development land
5. Arabian Ranches Land - AED 2,800,000 (18% discount) - Keywords: villa, family, community - Villa community development

HOME PROPERTIES:
1. Downtown Dubai Apartment - AED 1,500,000 (12% discount) - Keywords: luxury, city, views - 2BR apartment with city views
2. Palm Jumeirah Villa - AED 8,500,000 (8% discount) - Keywords: beachfront, luxury, villa - 5BR beachfront villa
3. Dubai Hills Villa - AED 3,200,000 (15% discount) - Keywords: golf, family, modern - 4BR villa with golf course access
4. Business Bay Apartment - AED 1,200,000 (20% discount) - Keywords: commercial, modern, investment - 1BR modern apartment
5. JBR Apartment - AED 2,100,000 (10% discount) - Keywords: beach, luxury, rental - 2BR beachfront apartment
6. Arabian Ranches Villa - AED 2,800,000 (22% discount) - Keywords: family, community, spacious - 3BR family villa
7. Dubai Marina Apartment - AED 1,800,000 (14% discount) - Keywords: waterfront, luxury, modern - 2BR marina view apartment
8. Jumeirah Villa - AED 6,500,000 (16% discount) - Keywords: beach, luxury, traditional - 4BR traditional beach villa

When users ask about properties, mention specific ones with prices and discounts.

CONTACT DETAILS:
- Email: support@nexgenai.asia
- Phone: +94 71 66 96 196

Always offer to connect users with our team for viewings or more information.`
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: 120,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content.trim();
    console.log(`   ✅ ChatGPT response: "${response}"`);
    return response;
    
  } catch (error) {
    console.error(`   ❌ ChatGPT API Error:`, error.message);
    
    // Fallback to predefined responses if ChatGPT fails
    const fallbackResponses = {
      'hello': 'Hello! How can I help you with your real estate needs today?',
      'hi': 'Hi there! I\'m here to assist you with property inquiries, scheduling viewings, or any real estate questions.',
      'properties': 'I can help you find properties! What type of property are you looking for?',
      'contact': 'You can contact our team at support@nexgenai.asia or call +94 71 66 96 196.',
      'schedule': 'I\'d be happy to help you schedule a viewing! Which property interests you?',
      'default': 'Thank you for your message! I\'m here to help with property inquiries. How can I assist you?'
    };

    const lowerMessage = userMessage.toLowerCase();
    for (const [keyword, response] of Object.entries(fallbackResponses)) {
      if (lowerMessage.includes(keyword)) {
        console.log(`   🔄 Using fallback response for keyword: ${keyword}`);
        return response;
      }
    }
    
    console.log(`   🔄 Using default fallback response`);
    return fallbackResponses.default;
  }
}



// Chat history storage (in production, use a database)
let chatHistory = [];

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Chatbot message endpoint
app.post('/api/chatbot/message', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    // Log incoming message
    console.log(`\n📨 [${new Date().toLocaleTimeString()}] Received message:`);
    console.log(`   Session ID: ${sessionId || 'default'}`);
    console.log(`   Message: "${message}"`);
    
    if (!message || typeof message !== 'string') {
      console.log(`   ❌ Invalid message format`);
      return res.status(400).json({ 
        error: 'Invalid message format',
        response: 'Please send a valid message.'
      });
    }

    // Get ChatGPT response
    const response = await getChatGPTResponse(message, sessionId);

    // Store chat history
    const chatEntry = {
      id: Date.now(),
      sessionId: sessionId || 'default',
      userMessage: message,
      botResponse: response,
      matchedKeyword: 'chatgpt',
      timestamp: new Date().toISOString()
    };
    
    chatHistory.push(chatEntry);
    
    // Keep only last 100 messages to prevent memory issues
    if (chatHistory.length > 100) {
      chatHistory = chatHistory.slice(-100);
    }

    // Log processing info
    console.log(`   🔍 Processing: "${message}"`);
    console.log(`   🎯 Response source: ChatGPT API`);
    console.log(`   💬 Response: "${response}"`);

    // Simulate typing delay
    setTimeout(() => {
      console.log(`   ✅ Sending response to session: ${sessionId || 'default'}`);
      res.json({
        success: true,
        response: response,
        sessionId: sessionId,
        timestamp: chatEntry.timestamp,
        matchedKeyword: 'chatgpt'
      });
    }, 1000 + Math.random() * 1000); // 1-2 second delay

  } catch (error) {
    console.error('❌ Chatbot error:', error);
    res.status(500).json({
      error: 'Internal server error',
      response: 'I apologize, but I\'m having trouble processing your request right now. Please try again.'
    });
  }
});

// Get chat history endpoint
app.get('/api/chatbot/history/:sessionId?', (req, res) => {
  try {
    const sessionId = req.params.sessionId || 'default';
    const sessionHistory = chatHistory.filter(chat => chat.sessionId === sessionId);
    
    res.json({
      success: true,
      history: sessionHistory,
      totalMessages: sessionHistory.length
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({
      error: 'Failed to retrieve chat history'
    });
  }
});

// Quick action endpoint
app.post('/api/chatbot/quick-action', async (req, res) => {
  try {
    const { action, sessionId } = req.body;
    
    // Log incoming quick action
    console.log(`\n⚡ [${new Date().toLocaleTimeString()}] Quick action triggered:`);
    console.log(`   Session ID: ${sessionId || 'default'}`);
    console.log(`   Action: "${action}"`);
    
    // Convert action to a natural message for ChatGPT
    const actionMessages = {
      'properties': 'I want to find properties',
      'contact': 'I want to contact an agent',
      'schedule': 'I want to schedule a viewing'
    };

    const userMessage = actionMessages[action] || `I selected the ${action} option`;
    
    // Get ChatGPT response for the quick action
    const response = await getChatGPTResponse(userMessage, sessionId);

    // Store quick action in history
    const chatEntry = {
      id: Date.now(),
      sessionId: sessionId || 'default',
      userMessage: `[Quick Action: ${action}]`,
      botResponse: response,
      matchedKeyword: action,
      timestamp: new Date().toISOString()
    };
    
    chatHistory.push(chatEntry);

    console.log(`   💬 Response: "${response}"`);
    console.log(`   ✅ Sending quick action response to session: ${sessionId || 'default'}`);

    res.json({
      success: true,
      response: response,
      action: action,
      sessionId: sessionId,
      timestamp: chatEntry.timestamp
    });

  } catch (error) {
    console.error('❌ Quick action error:', error);
    res.status(500).json({
      error: 'Failed to process quick action'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Chatbot backend is running'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 CHATBOT BACKEND SERVER STARTED');
  console.log('='.repeat(60));
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🤖 Chatbot API: http://localhost:${PORT}/api/chatbot`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(60));
  console.log('📊 Server Status: ONLINE');
  console.log('🔧 Environment: Development');
  console.log('📝 Logging: ENABLED');
  console.log('='.repeat(60));
  console.log('💡 Tips:');
  console.log(`   • Open http://localhost:${PORT} in your browser`);
  console.log('   • Check terminal for real-time message logs');
  console.log('   • Press Ctrl+C to stop the server');
  console.log('='.repeat(60) + '\n');
});

module.exports = app;
