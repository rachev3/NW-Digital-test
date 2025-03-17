import { Session } from "../models/session.js";

export const historyService = {
  /**
   * Create a new session
   * @param {string} sessionId - The session ID
   * @returns {Promise<Object>} - The created session
   */
  async createSession(sessionId) {
    try {
      const session = new Session({
        sessionId,
        startedAt: new Date(),
        lastActivity: new Date(),
        messages: [],
      });

      await session.save();
      return session;
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  },

  /**
   * Get a session by ID, or create it if it doesn't exist
   * @param {string} sessionId - The session ID
   * @returns {Promise<Object>} - The session
   */
  async getOrCreateSession(sessionId) {
    try {
      let session = await Session.findOne({ sessionId });

      if (!session) {
        session = await this.createSession(sessionId);
      }

      return session;
    } catch (error) {
      console.error("Error getting or creating session:", error);
      throw error;
    }
  },

  /**
   * Add a message to a session
   * @param {Object} messageData - The message data
   * @returns {Promise<Object>} - The updated session
   */
  async addMessage(messageData) {
    try {
      const { sessionId, direction, content, blockId } = messageData;

      // Get or create the session
      const session = await this.getOrCreateSession(sessionId);

      // Add the message
      session.messages.push({
        direction,
        content,
        timestamp: new Date(),
        blockId,
      });

      // Update the last activity timestamp
      session.lastActivity = new Date();

      // Update the current block ID if provided
      if (blockId) {
        session.currentBlockId = blockId;
      }

      // Save the session
      await session.save();

      return session;
    } catch (error) {
      console.error("Error adding message:", error);
      throw error;
    }
  },

  /**
   * Get a session by ID
   * @param {string} sessionId - The session ID
   * @returns {Promise<Object|null>} - The session or null if not found
   */
  async getSession(sessionId) {
    try {
      return await Session.findOne({ sessionId });
    } catch (error) {
      console.error("Error getting session:", error);
      throw error;
    }
  },

  /**
   * Get all sessions with pagination
   * @param {Object} options - Query options (pagination, filtering, etc.)
   * @returns {Promise<Object>} - The sessions with pagination info
   */
  async getAllSessions(options = {}) {
    try {
      const { page = 1, limit = 10 } = options;

      const sessions = await Session.find()
        .sort({ lastActivity: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Session.countDocuments();

      return {
        sessions,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalSessions: total,
      };
    } catch (error) {
      console.error("Error getting all sessions:", error);
      throw error;
    }
  },

  /**
   * Update the current block ID for a session
   * @param {string} sessionId - The session ID
   * @param {string} blockId - The block ID
   * @returns {Promise<Object>} - The updated session
   */
  async updateCurrentBlock(sessionId, blockId) {
    try {
      const session = await this.getOrCreateSession(sessionId);

      session.currentBlockId = blockId;
      session.lastActivity = new Date();

      await session.save();

      return session;
    } catch (error) {
      console.error("Error updating current block:", error);
      throw error;
    }
  },
};
