# Chatbot Flow API

A Node.js backend using Restify and WebSockets to manage a dynamic chatbot flow based on a JSON configuration. This backend allows users to upload and download chatbot flow configurations, process conversations in real time, and integrate with OpenAI for intent detection.

## Features

- RESTful API for managing chatbot flow configurations
- WebSocket server for real-time communication
- OpenAI integration for intent detection
- Conversation history tracking
- MongoDB for data storage
- Docker support for easy deployment

## Prerequisites

- Node.js 18 or higher
- MongoDB
- OpenAI API key

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/rachev3/NW-Digital-test.git
   cd NW-Digital-test
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/chatbot-flow
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Running the Application

### Development Mode

```
npm run dev
```

### Production Mode

```
npm start
```

### Using Docker

1. Make sure you have Docker and Docker Compose installed.

2. Build and start the containers:
   ```
   docker-compose up -d
   ```

## API Documentation

### Endpoints

#### Create JSON Config

- **URL**: `/api/config`
- **Method**: `POST`
- **Description**: Upload a new or updated JSON configuration defining the chatbot flow.
- **Request Body**: JSON object containing the chatbot flow configuration.
- **Response**: Success or failure status.

Example Request:

```json
{
  "blocks": [
    {
      "id": "welcome",
      "type": "write_message",
      "message": "Welcome to our chatbot! How can I help you today?",
      "nextBlock": "wait_for_intent"
    },
    {
      "id": "wait_for_intent",
      "type": "wait_for_response",
      "prompt": "Please tell me what you're looking for.",
      "intentDetection": {
        "enabled": true,
        "options": [
          {
            "intent": "weather",
            "nextBlock": "weather_response"
          },
          {
            "intent": "travel",
            "nextBlock": "travel_response"
          },
          {
            "intent": "restaurant",
            "nextBlock": "restaurant_response"
          }
        ]
      },
      "defaultNextBlock": "unknown_intent"
    },
    {
      "id": "weather_response",
      "type": "write_message",
      "message": "Here's the weather forecast for today."
    },
    {
      "id": "travel_response",
      "type": "write_message",
      "message": "Here are some travel offers for you."
    },
    {
      "id": "restaurant_response",
      "type": "write_message",
      "message": "Here are some restaurant recommendations."
    },
    {
      "id": "unknown_intent",
      "type": "write_message",
      "message": "I'm not sure what you're looking for. Could you please be more specific?",
      "nextBlock": "wait_for_intent"
    }
  ],
  "initialBlock": "welcome",
  "metadata": {
    "name": "Sample Chatbot Flow",
    "version": "1.0.0",
    "description": "A sample chatbot flow configuration"
  }
}
```

Example Response:

```json
{
  "success": true,
  "message": "Chatbot flow configuration saved successfully",
  "id": "60f1b2c3d4e5f6a7b8c9d0e1"
}
```

#### Get JSON Config

- **URL**: `/api/config`
- **Method**: `GET`
- **Description**: Retrieve the current JSON configuration that defines the chatbot flow.
- **Response**: The chatbot flow JSON configuration.

Example Response:

```json
{
  "_id": "60f1b2c3d4e5f6a7b8c9d0e1",
  "blocks": [...],
  "initialBlock": "welcome",
  "metadata": {...},
  "createdAt": "2023-07-16T12:34:56.789Z",
  "updatedAt": "2023-07-16T12:34:56.789Z"
}
```

### WebSocket Communication

- **URL**: `ws://localhost:3000`
- **Description**: A WebSocket server to facilitate real-time communication with the current chatbot JSON configuration.

#### Client Messages

Messages sent from the client to the server should be in JSON format:

```json
{
  "text": "What's the weather like today?"
}
```

#### Server Messages

Messages sent from the server to the client will be in JSON format:

```json
{
  "type": "message",
  "message": "Here's the weather forecast for today."
}
```

or

```json
{
  "type": "prompt",
  "message": "Please tell me what you're looking for."
}
```

or

```json
{
  "type": "error",
  "message": "An error occurred while processing your request."
}
```

## JSON Configuration Structure

The chatbot flow is defined as blocks in the JSON, with each block representing a chatbot step with specific functionality.

### Supported Block Types

#### Message Block

The chatbot sends a predefined message to the user.

```json
{
  "id": "welcome",
  "type": "message",
  "message": "Welcome to our chatbot!",
  "next": "wait_for_intent"
}
```

#### Wait Block

The chatbot waits for the user to respond and then proceeds to the next block.

```json
{
  "id": "wait_for_intent",
  "type": "wait",
  "next": "detect_intent"
}
```

#### Detect Intent Block

The chatbot analyzes the user's response and detects the intent using OpenAI integration.

```json
{
  "id": "detect_intent",
  "type": "detect_intent",
  "intents": [
    {
      "intent": "weather",
      "keywords": ["weather", "forecast", "temperature", "rain"],
      "next": "weather_response"
    },
    {
      "intent": "travel",
      "keywords": ["travel", "vacation", "trip", "flight"],
      "next": "travel_response"
    }
  ],
  "fallback": "unknown_intent"
}
```

### Example Configuration

Here's a complete example of a chatbot flow configuration:

```json
{
  "blocks": [
    {
      "id": "welcome",
      "type": "message",
      "message": "Welcome to our chatbot! How can I help you today?",
      "next": "wait_for_intent"
    },
    {
      "id": "wait_for_intent",
      "type": "wait",
      "next": "detect_intent"
    },
    {
      "id": "detect_intent",
      "type": "detect_intent",
      "intents": [
        {
          "intent": "weather",
          "keywords": ["weather", "forecast", "temperature", "rain"],
          "next": "weather_response"
        },
        {
          "intent": "travel",
          "keywords": ["travel", "vacation", "trip", "flight"],
          "next": "travel_response"
        },
        {
          "intent": "restaurant",
          "keywords": ["restaurant", "food", "eat", "dinner"],
          "next": "restaurant_response"
        }
      ],
      "fallback": "unknown_intent"
    },
    {
      "id": "weather_response",
      "type": "message",
      "message": "Here's the weather forecast for today."
    },
    {
      "id": "travel_response",
      "type": "message",
      "message": "Here are some travel offers for you."
    },
    {
      "id": "restaurant_response",
      "type": "message",
      "message": "Here are some restaurant recommendations."
    },
    {
      "id": "unknown_intent",
      "type": "message",
      "message": "I'm not sure what you're looking for. Could you please be more specific?",
      "next": "wait_for_intent"
    }
  ],
  "initialBlock": "welcome",
  "metadata": {
    "version": "1.0",
    "description": "A sample chatbot flow configuration"
  }
}
```

## License

ISC
