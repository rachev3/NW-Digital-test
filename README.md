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
    "description": "Sample chatbot flow configuration"
  },
  "blocks": [
    {
      "id": "block1",
      "type": "message",
      "message": "Welcome to our chatbot!",
      "next": "block2"
    },
    {
      "id": "block2",
      "type": "wait",
      "next": "block3"
    },
    {
      "id": "block3",
      "type": "detect_intent",
      "intents": [
        {
          "intent": "weather",
          "keywords": ["weather", "forecast"],
          "next": "block4"
        },
        {
          "intent": "travel",
          "keywords": ["travel", "trip", "offers"],
          "next": "block5"
        }
      ],
      "fallback": "block7"
    },
    {
      "id": "block4",
      "type": "message",
      "message": "Fetching weather details...",
      "next": null
    },
    {
      "id": "block5",
      "type": "message",
      "message": "Fetching travel offers...",
      "next": null
    },
    {
      "id": "block7",
      "type": "message",
      "message": "Sorry, I couldn't understand that. Please try again.",
      "next": "block3"
    }
  ],
  "initialBlock": "block1"
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
  "id": "block1",
  "type": "message",
  "message": "Welcome to our chatbot!",
  "next": "block2"
}
```

#### Wait Block

Waits for user input before proceeding:

```json
{
  "id": "block2",
  "type": "wait",
  "next": "block3"
}
```

#### Detect Intent Block

Analyzes user input to determine intent and choose the next block:

```json
{
  "id": "block3",
  "type": "detect_intent",
  "intents": [
    {
      "intent": "weather",
      "keywords": ["weather", "forecast"],
      "next": "block4"
    },
    {
      "intent": "travel",
      "keywords": ["travel", "trip", "offers"],
      "next": "block5"
    }
  ],
  "fallback": "block7"
}
```
