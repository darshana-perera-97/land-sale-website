# ALRAS REAL ESTATE Chatbot Backend

Node.js backend server for the ALRAS REAL ESTATE chatbot functionality.

## Features

- **Express.js Server**: Fast and lightweight web server
- **CORS Support**: Cross-origin requests enabled for frontend communication
- **Chat History**: Session-based chat history storage
- **Smart Responses**: Keyword-based response matching
- **Quick Actions**: Support for predefined quick action buttons
- **Typing Indicators**: Real-time typing indicators for better UX
- **Error Handling**: Comprehensive error handling and fallbacks

## API Endpoints

### POST `/api/chatbot/message`
Send a message to the chatbot.

**Request Body:**
```json
{
  "message": "Hello, I'm looking for properties",
  "sessionId": "session_1234567890_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Hello! How can I help you with your ALRAS REAL ESTATE needs today?",
  "sessionId": "session_1234567890_abc123",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "matchedKeyword": "hello"
}
```

### POST `/api/chatbot/quick-action`
Handle quick action button clicks.

**Request Body:**
```json
{
  "action": "properties",
  "sessionId": "session_1234567890_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "response": "I can help you find properties! What type of property are you looking for?",
  "action": "properties",
  "sessionId": "session_1234567890_abc123",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### GET `/api/chatbot/history/:sessionId?`
Get chat history for a session.

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "id": 1234567890,
      "sessionId": "session_1234567890_abc123",
      "userMessage": "Hello",
      "botResponse": "Hello! How can I help you?",
      "matchedKeyword": "hello",
      "timestamp": "2024-01-01T12:00:00.000Z"
    }
  ],
  "totalMessages": 1
}
```

### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "message": "ALRAS REAL ESTATE chatbot backend is running"
}
```

## Installation

1. **Install Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```

3. **Start Production Server:**
   ```bash
   npm start
   ```

## Configuration

- **Port**: Default port is 3000, can be changed with `PORT` environment variable
- **CORS**: Enabled for all origins (configure for production)
- **Chat History**: Stored in memory (use database for production)

## Development

The server includes:
- **Hot Reload**: Use `npm run dev` for development with nodemon
- **Static Files**: Serves frontend files from the parent directory
- **Error Logging**: Console logging for debugging
- **Session Management**: Unique session IDs for each chat session

## Production Considerations

For production deployment:

1. **Database**: Replace in-memory storage with a database (MongoDB, PostgreSQL, etc.)
2. **Environment Variables**: Use environment variables for configuration
3. **CORS**: Configure CORS for specific domains
4. **Rate Limiting**: Add rate limiting to prevent abuse
5. **Logging**: Implement proper logging system
6. **SSL**: Use HTTPS for secure communication
7. **Process Manager**: Use PM2 or similar for process management

## Chatbot Responses

The chatbot recognizes these keywords and provides appropriate responses:

- **Greetings**: hello, hi
- **Properties**: properties, apartment, villa, commercial
- **Contact**: contact, agent
- **Scheduling**: schedule, viewing
- **Pricing**: price, cost
- **Location**: location, dubai
- **Investment**: investment, buy, rent

## Frontend Integration

The frontend automatically connects to the backend at `http://localhost:3000`. Make sure the backend is running before testing the chatbot functionality.

## Troubleshooting

1. **Port Already in Use**: Change the PORT environment variable
2. **CORS Issues**: Check that CORS is properly configured
3. **Connection Errors**: Ensure the backend server is running
4. **Response Delays**: Check network connectivity and server logs
