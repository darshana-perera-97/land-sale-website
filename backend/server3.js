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
        userName: null,
        userContact: null,
        conversationStage: 'welcome', // 'welcome', 'properties', 'action_selection', 'contact_form', 'continue'
        conversationHistory: [] // Store actual conversation messages
      };
    }
    
    const session = sessionData[sessionId];
    let systemPrompt = '';
    
    // Determine conversation stage and create appropriate prompt
    if (session.conversationStage === 'welcome') {
      // Welcome stage - provide property information
      systemPrompt = `You are a real estate chatbot assistant for ALRAS REAL ESTATE.

CONVERSATION STAGE: Welcome and Property Information

COMPANY: ALRAS REAL ESTATE - Premium Real Estate Solutions

AVAILABLE PROPERTIES:

LAND PROPERTIES:
1. Dubai Hills Estate Land - AED 2,500,000 - Keywords: luxury, golf, family - Prime location with golf course views
2. Business Bay Plot - AED 1,800,000 - Keywords: commercial, downtown, investment - Commercial development opportunity
3. Jumeirah Village Land - AED 1,200,000  - Keywords: residential, affordable, growth - Upcoming residential area
4. Dubai Marina Plot - AED 3,200,000 - Keywords: waterfront, luxury, premium - Waterfront development land
5. Arabian Ranches Land - AED 2,800,000 - Keywords: villa, family, community - Villa community development

HOME PROPERTIES:
1. Downtown Dubai Apartment - AED 1,500,000 - Keywords: luxury, city, views - 2BR apartment with city views
2. Palm Jumeirah Villa - AED 8,500,000 - Keywords: beachfront, luxury, villa - 5BR beachfront villa
3. Dubai Hills Villa - AED 3,200,000 - Keywords: golf, family, modern - 4BR villa with golf course access
4. Business Bay Apartment - AED 1,200,000 - Keywords: commercial, modern, investment - 1BR modern apartment
5. JBR Apartment - AED 2,100,000 - Keywords: beach, luxury, rental - 2BR beachfront apartment
6. Arabian Ranches Villa - AED 2,800,000 - Keywords: family, community, spacious - 3BR family villa
7. Dubai Marina Apartment - AED 1,800,000 - Keywords: waterfront, luxury, modern - 2BR marina view apartment
8. Jumeirah Villa - AED 6,500,000 - Keywords: beach, luxury, traditional - 4BR traditional beach villa

INSTRUCTIONS: 
- Welcome the user warmly
- Provide a brief overview of our premium properties
- Mention the special discounts available
- Be engaging and professional
- After providing property information, indicate that action buttons will appear for next steps

RESPONSE EXAMPLE: "Welcome to ALRAS REAL ESTATE! We offer premium land and home properties across Dubai with exclusive discounts. Our portfolio includes luxury villas in Palm Jumeirah, modern apartments in Downtown Dubai, and prime land plots in Dubai Hills Estate and Business Bay. All properties come with special discounts ranging from 5-8%. How can I assist you today?"`;
      
    } else if (session.conversationStage === 'properties') {
      // Properties stage - provide detailed property information
      systemPrompt = `You are a real estate chatbot assistant for ALRAS REAL ESTATE.

CONVERSATION STAGE: Providing Detailed Property Information

COMPANY: ALRAS REAL ESTATE - Premium Real Estate Solutions

AVAILABLE PROPERTIES:

LAND PROPERTIES:
1. Dubai Hills Estate Land - AED 2,500,000  - Keywords: luxury, golf, family - Prime location with golf course views
2. Business Bay Plot - AED 1,800,000  - Keywords: commercial, downtown, investment - Commercial development opportunity
3. Jumeirah Village Land - AED 1,200,000 - Keywords: residential, affordable, growth - Upcoming residential area
4. Dubai Marina Plot - AED 3,200,000 - Keywords: waterfront, luxury, premium - Waterfront development land
5. Arabian Ranches Land - AED 2,800,000 - Keywords: villa, family, community - Villa community development

HOME PROPERTIES:
1. Downtown Dubai Apartment - AED 1,500,000 - Keywords: luxury, city, views - 2BR apartment with city views
2. Palm Jumeirah Villa - AED 8,500,000 - Keywords: beachfront, luxury, villa - 5BR beachfront villa
3. Dubai Hills Villa - AED 3,200,000 - Keywords: golf, family, modern - 4BR villa with golf course access
4. Business Bay Apartment - AED 1,200,000 - Keywords: commercial, modern, investment - 1BR modern apartment
5. JBR Apartment - AED 2,100,000 - Keywords: beach, luxury, rental - 2BR beachfront apartment
6. Arabian Ranches Villa - AED 2,800,000 - Keywords: family, community, spacious - 3BR family villa
7. Dubai Marina Apartment - AED 1,800,000 - Keywords: waterfront, luxury, modern - 2BR marina view apartment
8. Jumeirah Villa - AED 6,500,000 - Keywords: beach, luxury, traditional - 4BR traditional beach villa

INSTRUCTIONS: 
- Provide detailed information about properties
- Answer specific questions about pricing, locations, features
- Be informative and helpful
- After providing information, indicate that action buttons will appear for next steps

RESPONSE EXAMPLE: "Here are more details about our properties: [Provide specific information based on user's question]. Would you like to know more about any specific property or location?"`;
      
    } else if (session.conversationStage === 'continue') {
      // Continue stage - normal conversation with context
      const recentQuestions = session.conversationHistory ? 
        session.conversationHistory.slice(-4).map(msg => msg.content).join(', ') : 
        'No previous questions recorded';
      
      systemPrompt = `You are a real estate chatbot assistant for ALRAS REAL ESTATE.

CONVERSATION STAGE: Continuing conversation with user details

USER INFO: Name - ${session.userName}, Contact - ${session.userContact}

CONVERSATION HISTORY: The user's recent questions were: ${recentQuestions}

INSTRUCTIONS: 
- Continue the conversation naturally, referencing their previous questions if relevant
- Be personalized and friendly, using their name when appropriate
- You can provide property information, schedule viewings, or answer any real estate questions
- Offer to connect them with our real estate agent Suno for further assistance
- Be helpful and professional

AGENT NAME: Suno

AVAILABLE PROPERTIES:

LAND PROPERTIES:
1. Dubai Hills Estate Land - AED 2,500,000  - Keywords: luxury, golf, family - Prime location with golf course views
2. Business Bay Plot - AED 1,800,000 - Keywords: commercial, downtown, investment - Commercial development opportunity
3. Jumeirah Village Land - AED 1,200,000 - Keywords: residential, affordable, growth - Upcoming residential area
4. Dubai Marina Plot - AED 3,200,000  - Keywords: waterfront, luxury, premium - Waterfront development land
5. Arabian Ranches Land - AED 2,800,000  - Keywords: villa, family, community - Villa community development

HOME PROPERTIES:
1. Downtown Dubai Apartment - AED 1,500,000  - Keywords: luxury, city, views - 2BR apartment with city views
2. Palm Jumeirah Villa - AED 8,500,000  - Keywords: beachfront, luxury, villa - 5BR beachfront villa
3. Dubai Hills Villa - AED 3,200,000 - Keywords: golf, family, modern - 4BR villa with golf course access
4. Business Bay Apartment - AED 1,200,000  - Keywords: commercial, modern, investment - 1BR modern apartment
5. JBR Apartment - AED 2,100,000 - Keywords: beach, luxury, rental - 2BR beachfront apartment
6. Arabian Ranches Villa - AED 2,800,000 - Keywords: family, community, spacious - 3BR family villa
7. Dubai Marina Apartment - AED 1,800,000 - Keywords: waterfront, luxury, modern - 2BR marina view apartment
8. Jumeirah Villa - AED 6,500,000 - Keywords: beach, luxury, traditional - 4BR traditional beach villa

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
        userName: null,
        userContact: null,
        conversationStage: 'welcome',
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
    if (session.conversationStage === 'welcome') {
      // After first user message, move to properties stage
      session.conversationStage = 'properties';
      console.log(`   🔄 Moving to properties stage`);
      
    } else if (session.conversationStage === 'properties') {
      // Stay in properties stage for detailed information
      console.log(`   📊 Providing property details`);
      
    } else if (session.conversationStage === 'contact_form') {
      // Handle contact form submission
      if (message.toLowerCase().includes('name') || message.toLowerCase().includes('contact')) {
        // This is likely a name or contact, store it
        if (!session.userName) {
          session.userName = message.trim();
          console.log(`   👤 Name collected: ${session.userName}`);
        } else if (!session.userContact) {
          session.userContact = message.trim();
          session.conversationStage = 'continue';
          console.log(`   📞 Contact collected: ${session.userContact}`);
        }
      }
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

    // Determine if we should show action buttons
    let showButtons = false;
    if (session.conversationStage === 'properties' && session.conversationHistory.length > 2) {
      showButtons = true;
    }
    
    // Don't show buttons if user has already submitted contact form
    if (session.conversationStage === 'continue' || session.conversationStage === 'contact_form') {
      showButtons = false;
    }
    
    // Store chat history
    const chatEntry = {
      id: Date.now(),
      sessionId: sessionId || 'default',
      userMessage: message,
      botResponse: response,
      matchedKeyword: 'chatgpt',
      timestamp: new Date().toISOString(),
      conversationStage: session.conversationStage
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
    console.log(`   📈 Stage: ${session.conversationStage}`);
    console.log(`   🔘 Show buttons: ${showButtons}`);

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
        showButtons: showButtons
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

// Button action endpoint
app.post('/api/chatbot/button-action', async (req, res) => {
  try {
    const { action, sessionId } = req.body;
    
    // Log incoming button action
    console.log(`\n🔘 [${new Date().toLocaleTimeString()}] Button action triggered:`);
    console.log(`   Session ID: ${sessionId || 'default'}`);
    console.log(`   Action: "${action}"`);
    
    // Initialize session data if it doesn't exist
    if (!sessionData[sessionId]) {
      sessionData[sessionId] = {
        userName: null,
        userContact: null,
        conversationStage: 'welcome',
        conversationHistory: []
      };
    }
    
    const session = sessionData[sessionId];
    let response = '';
    let showContactForm = false;
    
    if (action === 'schedule_call') {
      // Handle schedule call action
      response = "I'd be happy to help you schedule a call with our sales team! Please provide your contact information below so our team can reach out to you soon.";
      session.conversationStage = 'contact_form';
      showContactForm = true;
      console.log(`   📞 Schedule call requested - showing contact form`);
      
    } else if (action === 'more_details') {
      // Handle more details action
      response = "Here are more detailed information about our properties:\n\n" +
        "🏠 **LAND PROPERTIES:**\n" +
        "• Dubai Hills Estate Land - AED 2,500,000  - Prime location with golf course views, perfect for luxury villa development\n" +
        "• Business Bay Plot - AED 1,800,000  - Commercial development opportunity in downtown Dubai\n" +
        "• Jumeirah Village Land - AED 1,200,000  - Upcoming residential area with great growth potential\n" +
        "• Dubai Marina Plot - AED 3,200,000 - Waterfront development land with premium location\n" +
        "• Arabian Ranches Land - AED 2,800,000  - Villa community development with family-friendly environment\n\n" +
        "🏡 **HOME PROPERTIES:**\n" +
        "• Downtown Dubai Apartment - AED 1,500,000 (7% High ROI) - 2BR apartment with stunning city views\n" +
        "• Palm Jumeirah Villa - AED 8,500,000 (8% High ROI) - 5BR beachfront villa with private beach access\n" +
        "• Dubai Hills Villa - AED 3,200,000 (6% High ROI) - 4BR villa with golf course access\n" +
        "• Business Bay Apartment - AED 1,200,000 (7% High ROI) - 1BR modern apartment for investment\n" +
        "• JBR Apartment - AED 2,100,000 (7% High ROI) - 2BR beachfront apartment with rental potential\n" +
        "• Arabian Ranches Villa - AED 2,800,000 (6% High ROI) - 3BR family villa in gated community\n" +
        "• Dubai Marina Apartment - AED 1,800,000 (7% High ROI) - 2BR marina view apartment\n" +
        "• Jumeirah Villa - AED 6,500,000 (6% High ROI) - 4BR traditional beach villa\n\n" +
        "All properties come with special discounts and our team can provide more specific details about any property that interests you!";
      console.log(`   📋 More details provided`);
    }
    
    // Store button action in history
    const chatEntry = {
      id: Date.now(),
      sessionId: sessionId || 'default',
      userMessage: `[Button Action: ${action}]`,
      botResponse: response,
      matchedKeyword: action,
      timestamp: new Date().toISOString()
    };
    
    chatHistory.push(chatEntry);
    
    console.log(`   💬 Response: "${response}"`);
    console.log(`   ✅ Sending button action response to session: ${sessionId || 'default'}`);

    res.json({
      success: true,
      response: response,
      action: action,
      sessionId: sessionId,
      timestamp: chatEntry.timestamp,
      conversationStage: session.conversationStage,
      showContactForm: showContactForm
    });

  } catch (error) {
    console.error('❌ Button action error:', error);
    res.status(500).json({
      error: 'Failed to process button action'
    });
  }
});

// Contact collection endpoint
app.post('/api/chatbot/contact', async (req, res) => {
  try {
    const { name, phone, sessionId } = req.body;
    
    console.log(`\n📞 [${new Date().toLocaleTimeString()}] Contact information collected:`);
    console.log(`   Session ID: ${sessionId || 'default'}`);
    console.log(`   Name: ${name}`);
    console.log(`   Phone: ${phone}`);
    
    // Store contact information (in production, save to database)
    const contactEntry = {
      id: Date.now(),
      sessionId: sessionId || 'default',
      name: name,
      phone: phone,
      timestamp: new Date().toISOString()
    };
    
    // Update session data
    if (sessionData[sessionId]) {
      sessionData[sessionId].userName = name;
      sessionData[sessionId].userContact = phone;
      sessionData[sessionId].conversationStage = 'continue';
    }
    
    // In production, save to database
    console.log(`   ✅ Contact information stored for session: ${sessionId || 'default'}`);
    
    res.json({
      success: true,
      message: 'Our sales team will contact you soon',
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
