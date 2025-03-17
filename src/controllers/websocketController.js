import { chatbotService } from "../services/chatbotService.js";
import { configService } from "../services/configService.js";
import { historyService } from "../services/historyService.js";

// Store active connections
const activeConnections = new Map();

export const websocketHandler = {
  /**
   * Handle new WebSocket connection
   * @param {WebSocket} ws - WebSocket connection
   */
  async handleConnection(ws) {
    try {
      // Generate a unique ID for this connection
      const sessionId = Date.now().toString();

      // Store the connection
      activeConnections.set(sessionId, {
        ws,
        sessionId,
      });

      // Attach the session ID to the WebSocket object
      ws.sessionId = sessionId;

      // Get the current chatbot configuration
      const config = await configService.getConfig();

      if (!config) {
        this.sendMessage(ws, {
          type: "error",
          message: "No chatbot configuration found",
        });
        return;
      }

      // Start the chatbot flow
      const initialResponse = await chatbotService.startFlow(config, sessionId);

      // Send the initial response to the client
      this.sendMessage(ws, initialResponse);
    } catch (error) {
      console.error("Error handling WebSocket connection:", error);
      this.sendMessage(ws, {
        type: "error",
        message: "Failed to initialize chatbot flow",
      });
    }
  },

  /**
   * Handle incoming WebSocket message
   * @param {WebSocket} ws - WebSocket connection
   * @param {string|Buffer} message - Incoming message
   */
  async handleMessage(ws, message) {
    try {
      const sessionId = ws.sessionId;

      if (!sessionId || !activeConnections.has(sessionId)) {
        this.sendMessage(ws, {
          type: "error",
          message: "Invalid session",
        });
        return;
      }

      // Parse the message
      let parsedMessage;
      try {
        parsedMessage = JSON.parse(message.toString());
      } catch (e) {
        this.sendMessage(ws, {
          type: "error",
          message: "Invalid message format. Expected JSON.",
        });
        return;
      }

      // Get the current chatbot configuration
      const config = await configService.getConfig();

      if (!config) {
        this.sendMessage(ws, {
          type: "error",
          message: "No chatbot configuration found",
        });
        return;
      }

      // Process the message through the chatbot flow
      const response = await chatbotService.processMessage(
        parsedMessage,
        config,
        sessionId
      );

      // Send the response back to the client
      this.sendMessage(ws, response);
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
      this.sendMessage(ws, {
        type: "error",
        message: "Failed to process message",
      });
    }
  },

  /**
   * Handle WebSocket disconnection
   * @param {WebSocket} ws - WebSocket connection
   */
  handleDisconnection(ws) {
    const sessionId = ws.sessionId;

    if (sessionId && activeConnections.has(sessionId)) {
      // Clean up the connection
      activeConnections.delete(sessionId);
    }
  },

  /**
   * Send a message to the client
   * @param {WebSocket} ws - WebSocket connection
   * @param {Object} message - Message to send
   */
  sendMessage(ws, message) {
    if (ws.readyState === 1) {
      // OPEN
      ws.send(JSON.stringify(message));
    }
  },
};
