require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3001;

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
    
    // Initialize session data if it doesn't exist
    if (!sessionData[sessionId]) {
      sessionData[sessionId] = {
        questionCount: 0,
        userName: null,
        userContact: null,
        conversationStage: 'questions', // 'questions', 'name', 'contact', 'continue'
        conversationHistory: [] // Store actual conversation messages
      };
    }
    
    const session = sessionData[sessionId];
    let systemPrompt = '';
    
    // Determine conversation stage and create appropriate prompt
    if (session.conversationStage === 'questions' && session.questionCount < 4) {
      // First 4 questions - provide answers
      systemPrompt = `You are a real estate chatbot assistant for ALRAS REAL ESTATE. 

CONVERSATION STAGE: Answering questions (Question ${session.questionCount + 1} of 4)

COMPANY: ALRAS REAL ESTATE - Premium Real Estate Solutions

AVAILABLE PROPERTIES:

LAND PROPERTIES:
1. Dubai Hills Estate Land - AED 2,500,000 (7% discount) - Keywords: luxury, golf, family - Prime location with golf course views
2. Business Bay Plot - AED 1,800,000 (5% discount) - Keywords: commercial, downtown, investment - Commercial development opportunity
3. Jumeirah Village Land - AED 1,200,000 (5% discount) - Keywords: residential, affordable, growth - Upcoming residential area
4. Dubai Marina Plot - AED 3,200,000 (7% discount) - Keywords: waterfront, luxury, premium - Waterfront development land
5. Arabian Ranches Land - AED 2,800,000 (8% discount) - Keywords: villa, family, community - Villa community development

HOME PROPERTIES:
1. Downtown Dubai Apartment - AED 1,500,000 (7% discount) - Keywords: luxury, city, views - 2BR apartment with city views
2. Palm Jumeirah Villa - AED 8,500,000 (8% discount) - Keywords: beachfront, luxury, villa - 5BR beachfront villa
3. Dubai Hills Villa - AED 3,200,000 (6% discount) - Keywords: golf, family, modern - 4BR villa with golf course access
4. Business Bay Apartment - AED 1,200,000 (7% High ROI) - Keywords: commercial, modern, investment - 1BR modern apartment
5. JBR Apartment - AED 2,100,000 (7% discount) - Keywords: beach, luxury, rental - 2BR beachfront apartment
6. Arabian Ranches Villa - AED 2,800,000 (6% discount) - Keywords: family, community, spacious - 3BR family villa
7. Dubai Marina Apartment - AED 1,800,000 (7% discount) - Keywords: waterfront, luxury, modern - 2BR marina view apartment
8. Jumeirah Villa - AED 6,500,000 (6% discount) - Keywords: beach, luxury, traditional - 4BR traditional beach villa

INSTRUCTIONS: Provide helpful answers about properties, pricing, locations, or real estate services. Be informative and engaging. After answering, wait for the next question.`;
      
    } else if (session.conversationStage === 'questions' && session.questionCount >= 4) {
      // After 4 questions, ask for name
      systemPrompt = `You are a real estate chatbot assistant for ALRAS REAL ESTATE.

CONVERSATION STAGE: Collecting user information

INSTRUCTIONS: The user has asked 4 questions. Now ask for their name to continue the conversation. Be friendly and professional.

RESPONSE: "I'd be happy to help you further. Could you please tell me your name so I can assist you better?"`;
      
    } else if (session.conversationStage === 'name') {
      // After getting name, ask for contact number
      systemPrompt = `You are a real estate chatbot assistant for ALRAS REAL ESTATE.

CONVERSATION STAGE: Collecting contact information

USER NAME: ${session.userName}

INSTRUCTIONS: The user has provided their name. Now ask for their contact number. Be friendly and professional.

RESPONSE: "Nice to meet you, ${session.userName}! Could you please provide your contact number?"`;
      
    } else if (session.conversationStage === 'contact') {
      // After getting contact, continue normal conversation with context
      const recentQuestions = session.conversationHistory ? 
        session.conversationHistory.slice(-4).map(msg => msg.content).join(', ') : 
        'No previous questions recorded';
      
      systemPrompt = `You are a real estate chatbot assistant for ALRAS REAL ESTATE.

CONVERSATION STAGE: Continuing conversation with user details

USER INFO: Name - ${session.userName}, Contact - ${session.userContact}

CONVERSATION HISTORY: The user has asked ${session.questionCount} questions about real estate properties and services. Their recent questions were: ${recentQuestions}

INSTRUCTIONS: 
- Acknowledge that you now have their contact information
- Continue the conversation naturally, referencing their previous questions if relevant
- Be personalized and friendly, using their name when appropriate
- You can provide property information, schedule viewings, or answer any real estate questions
- Offer to connect them with our real estate agent Suno for further assistance
- Be helpful and professional

AGENT NAME: Suno

AVAILABLE PROPERTIES:

LAND PROPERTIES:
1. Dubai Hills Estate Land - AED 2,500,000 (7% discount) - Keywords: luxury, golf, family - Prime location with golf course views
2. Business Bay Plot - AED 1,800,000 (5% discount) - Keywords: commercial, downtown, investment - Commercial development opportunity
3. Jumeirah Village Land - AED 1,200,000 (5% discount) - Keywords: residential, affordable, growth - Upcoming residential area
4. Dubai Marina Plot - AED 3,200,000 (7% discount) - Keywords: waterfront, luxury, premium - Waterfront development land
5. Arabian Ranches Land - AED 2,800,000 (8% discount) - Keywords: villa, family, community - Villa community development

HOME PROPERTIES:
1. Downtown Dubai Apartment - AED 1,500,000 (7% discount) - Keywords: luxury, city, views - 2BR apartment with city views
2. Palm Jumeirah Villa - AED 8,500,000 (8% discount) - Keywords: beachfront, luxury, villa - 5BR beachfront villa
3. Dubai Hills Villa - AED 3,200,000 (6% discount) - Keywords: golf, family, modern - 4BR villa with golf course access
4. Business Bay Apartment - AED 1,200,000 (7% High ROI) - Keywords: commercial, modern, investment - 1BR modern apartment
5. JBR Apartment - AED 2,100,000 (7% discount) - Keywords: beach, luxury, rental - 2BR beachfront apartment
6. Arabian Ranches Villa - AED 2,800,000 (6% discount) - Keywords: family, community, spacious - 3BR family villa
7. Dubai Marina Apartment - AED 1,800,000 (7% discount) - Keywords: waterfront, luxury, modern - 2BR marina view apartment
8. Jumeirah Villa - AED 6,500,000 (6% discount) - Keywords: beach, luxury, traditional - 4BR traditional beach villa

EXAMPLE RESPONSES:
- "Thank you for providing your contact information, ${session.userName}! Now that I have your details, I can better assist you with your real estate needs. Based on our previous conversation, would you like me to provide more specific information about any properties that interest you?"
- "Perfect! I have your contact details now, ${session.userName}. I can connect you with our real estate agent Suno who can provide personalized assistance based on your requirements. Would you like to schedule a viewing or get more detailed information about any specific properties?"`;
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: 150,
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
      'contact': 'You can contact our team at info@alrasservices.com or call +971 508775526.',
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

// Session tracking for conversation flow
let sessionData = {};

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

    // Initialize session data if it doesn't exist
    if (!sessionData[sessionId]) {
      sessionData[sessionId] = {
        questionCount: 0,
        userName: null,
        userContact: null,
        conversationStage: 'questions',
        conversationHistory: [] // Store actual conversation messages
      };
    }

    const session = sessionData[sessionId];
    
    // Ensure conversationHistory exists
    if (!session.conversationHistory) {
      session.conversationHistory = [];
    }
    
    // Store user message in conversation history
    session.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });
    
    // Handle conversation flow logic
    if (session.conversationStage === 'questions' && session.questionCount < 4) {
      // Count this as a question
      session.questionCount++;
      console.log(`   📊 Question count: ${session.questionCount}/4`);
      
    } else if (session.conversationStage === 'questions' && session.questionCount >= 4) {
      // After 4 questions, move to name collection stage
      session.conversationStage = 'name';
      console.log(`   🔄 Moving to name collection stage`);
      
    } else if (session.conversationStage === 'name') {
      // Store the name and move to contact collection
      session.userName = message.trim();
      session.conversationStage = 'contact';
      console.log(`   👤 Name collected: ${session.userName}`);
      
    } else if (session.conversationStage === 'contact') {
      // Store the contact and move to continue stage
      session.userContact = message.trim();
      session.conversationStage = 'continue';
      console.log(`   📞 Contact collected: ${session.userContact}`);
    }

    // Get ChatGPT response
    const response = await getChatGPTResponse(message, sessionId);

    // Store bot response in conversation history
    if (!session.conversationHistory) {
      session.conversationHistory = [];
    }
    session.conversationHistory.push({
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    });

    // Store chat history
    const chatEntry = {
      id: Date.now(),
      sessionId: sessionId || 'default',
      userMessage: message,
      botResponse: response,
      matchedKeyword: 'chatgpt',
      timestamp: new Date().toISOString(),
      conversationStage: session.conversationStage,
      questionCount: session.questionCount
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
    console.log(`   📈 Stage: ${session.conversationStage}, Questions: ${session.questionCount}`);

    // Simulate typing delay
    setTimeout(() => {
      console.log(`   ✅ Sending response to session: ${sessionId || 'default'}`);
      res.json({
        success: true,
        response: response,
        sessionId: sessionId,
        timestamp: chatEntry.timestamp,
        matchedKeyword: 'chatgpt',
        conversationStage: session.conversationStage,
        questionCount: session.questionCount
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

// Contact collection endpoint
app.post('/api/chatbot/contact', async (req, res) => {
  try {
    const { name, email, phone, property, sessionId } = req.body;
    
    console.log(`\n📞 [${new Date().toLocaleTimeString()}] Contact information collected:`);
    console.log(`   Session ID: ${sessionId || 'default'}`);
    console.log(`   Name: ${name}`);
    console.log(`   Email: ${email}`);
    console.log(`   Phone: ${phone}`);
    console.log(`   Property: ${property || 'Not specified'}`);
    
    // Store contact information (in production, save to database)
    const contactEntry = {
      id: Date.now(),
      sessionId: sessionId || 'default',
      name: name,
      email: email,
      phone: phone,
      property: property || 'Not specified',
      timestamp: new Date().toISOString()
    };
    
    // In production, save to database
    console.log(`   ✅ Contact information stored for session: ${sessionId || 'default'}`);
    
    res.json({
      success: true,
      message: 'Thank you for your information! Our team will contact you soon.',
      contactId: contactEntry.id,
      timestamp: contactEntry.timestamp
    });

  } catch (error) {
    console.error('❌ Contact collection error:', error);
    res.status(500).json({
      error: 'Failed to process contact information'
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
