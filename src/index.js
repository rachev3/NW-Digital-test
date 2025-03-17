import restify from "restify";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import { configController } from "./controllers/configController.js";
import { websocketHandler } from "./controllers/websocketController.js";
import { connectToDatabase } from "./utils/database.js";

// Load environment variables
dotenv.config();

// Connect to the database
connectToDatabase();

// Create Restify server
const server = restify.createServer({
  name: "chatbot-flow-api",
  version: "1.0.0",
});

// Middleware
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser());

// CORS handling
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.send(204);
  }

  return next();
});

// API Routes
server.post("/api/config", configController.createConfig);
server.get("/api/config", configController.getConfig);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`${server.name} listening at ${server.url}`);

  // Initialize WebSocket server
  const wss = new WebSocketServer({ server: server.server });

  wss.on("connection", (ws) => {
    console.log("Client connected to WebSocket");
    websocketHandler.handleConnection(ws);

    ws.on("message", (message) => {
      websocketHandler.handleMessage(ws, message);
    });

    ws.on("close", () => {
      console.log("Client disconnected from WebSocket");
      websocketHandler.handleDisconnection(ws);
    });
  });
});

// Handle graceful shutdown
const gracefulShutdown = async () => {
  console.log("Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
};

// Listen for termination signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

export default server;
