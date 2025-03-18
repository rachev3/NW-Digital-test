# Node.js Chatbot Backend with Restify and WebSocket

A flexible, dynamic chatbot backend system built with Node.js, Restify, and WebSockets. This application allows you to define chatbot conversation flows using a JSON configuration, process real-time conversations, and integrate with OpenAI for intent detection.

## Features

- **RESTful API** for managing chatbot configurations
- **Real-time WebSocket communication** for chat interactions
- **Dynamic chatbot flow** based on JSON configuration
- **OpenAI integration** for natural language intent detection
- **Conversation history tracking**
- **Fallback keyword matching** when OpenAI is unavailable
- **MongoDB database** for persistent storage

## Prerequisites

- Node.js 14.x or higher
- MongoDB 4.x or higher
- OpenAI API key (for intent detection)

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/chatbot-backend.git
   cd chatbot-backend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/chatbot
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

### Chatbot Configuration

#### Create/Update Configuration

- **URL**: `/api/config`
- **Method**: `POST`
- **Body**: JSON object containing the chatbot flow configuration
- **Response**: Success message with the configuration ID

Example request body:

```json
{
  "metadata": {
    "version": "1.0",
    "description": "Test chatbot flow configuration"
  },
  "blocks": [
    {
      "id": "welcome",
      "type": "message",
      "message": "Welcome to the test chatbot! How can I help you today?",
      "next": "user_input",
      "intents": []
    },
    {
      "id": "user_input",
      "type": "wait",
      "next": "detect_main_intent",
      "intents": []
    },
    {
      "id": "detect_main_intent",
      "type": "detect_intent",
      "intents": [
        {
          "intent": "greeting",
          "keywords": ["hello", "hi", "hey", "greetings"],
          "next": "greeting_response"
        },
        {
          "intent": "weather",
          "keywords": ["weather", "temperature", "forecast", "rain", "sunny"],
          "next": "weather_response"
        },
        {
          "intent": "help",
          "keywords": ["help", "assist", "support", "guide"],
          "next": "help_response"
        },
        {
          "intent": "goodbye",
          "keywords": ["bye", "goodbye", "exit", "quit", "end"],
          "next": "goodbye_response"
        }
      ],
      "fallback": "unknown_intent"
    },
    {
      "id": "greeting_response",
      "type": "message",
      "message": "Hello there! What would you like to know about today?",
      "next": "user_input",
      "intents": []
    },
    {
      "id": "weather_response",
      "type": "message",
      "message": "The weather today is sunny with a high of 75°F. Is there anything else you'd like to know?",
      "next": "user_input",
      "intents": []
    },
    {
      "id": "help_response",
      "type": "message",
      "message": "I can provide information about the weather, or just chat with you. What would you like to do?",
      "next": "user_input",
      "intents": []
    },
    {
      "id": "goodbye_response",
      "type": "message",
      "message": "Thank you for chatting! Have a great day!",
      "next": null,
      "intents": []
    },
    {
      "id": "unknown_intent",
      "type": "message",
      "message": "I'm not sure I understand. Could you try asking in a different way?",
      "next": "user_input",
      "intents": []
    }
  ],
  "initialBlock": "welcome"
}
```

#### Get Current Configuration

- **URL**: `/api/config`
- **Method**: `GET`
- **Response**: Current chatbot flow configuration

## WebSocket API

### Connection

- **URL**: `ws://localhost:3000`
- **Event**: On connect, the server starts the chatbot flow and sends the initial message based on the current configuration.

### Messages

#### Client to Server

Send a JSON message with a text property:

```json
{
  "text": "What's the weather like today?"
}
```

#### Server to Client

The server will respond with one of the following message types:

- **Message response**:

  ```json
  {
    "type": "message",
    "message": "Welcome to our chatbot!"
  }
  ```

- **Prompt for input**:

  ```json
  {
    "type": "prompt",
    "message": "Please respond..."
  }
  ```

- **Error response**:
  ```json
  {
    "type": "error",
    "message": "Error message details"
  }
  ```

## Chatbot Flow Configuration

### Block Types

#### Message Block

Displays a message to the user:

```json
{
  "id": "greeting_response",
  "type": "message",
  "message": "Hello there! What would you like to know about today?",
  "next": "user_input",
  "intents": []
}
```

#### Wait Block

Waits for user input before proceeding:

```json
{
  "id": "user_input",
  "type": "wait",
  "next": "detect_main_intent",
  "intents": []
}
```

#### Detect Intent Block

Analyzes user input to determine intent and choose the next block:

```json
{
  "id": "detect_main_intent",
  "type": "detect_intent",
  "intents": [
    {
      "intent": "weather",
      "keywords": ["weather", "temperature", "forecast", "rain", "sunny"],
      "next": "weather_response"
    },
    {
      "intent": "help",
      "keywords": ["help", "assist", "support", "guide"],
      "next": "help_response"
    }
  ],
  "fallback": "unknown_intent"
}
```

## Testing

Run the test suite with:

```
npm test
```

## Docker Setup

This project includes Docker configuration for easy deployment:

1. Make sure Docker and Docker Compose are installed on your system
2. Create a `.env` file with your environment variables
3. Build and start the containers:
   ```
   docker-compose up -d
   ```
4. To stop the containers:
   ```
   docker-compose down
   ```

The Docker setup includes:

- Node.js application container
- MongoDB container with data persistence
- Automatic environment variable configuration

## Project Structure

```
├── src/
│   ├── controllers/     # Request handlers for API endpoints
│   ├── models/          # Database models
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions and utilities
│   └── index.js         # Application entry point
├── .env                 # Environment variables
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker compose configuration
└── package.json         # Project dependencies
```

## Environment Variables

| Variable       | Description                         | Default | Required |
| -------------- | ----------------------------------- | ------- | -------- |
| PORT           | Port to run the server on           | 3000    | No       |
| MONGODB_URI    | MongoDB connection string           | -       | Yes      |
| OPENAI_API_KEY | OpenAI API key for intent detection | -       | Yes      |

## WebSocket Session Management

When a client connects to the WebSocket server:

1. A unique session ID is generated for the connection
2. The session is stored in the database
3. All messages in the conversation are linked to this session ID
4. If the connection is lost, the session can be resumed by providing the session ID
