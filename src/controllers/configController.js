import { configService } from "../services/configService.js";

export const configController = {
  /**
   * Create or update a chatbot flow configuration
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createConfig(req, res) {
    try {
      // Validate the request body
      if (!req.body || Object.keys(req.body).length === 0) {
        res.send(400, {
          error:
            "Request body is required and must contain a valid JSON configuration",
        });
        return;
      }

      // Save the configuration
      const result = await configService.saveConfig(req.body);

      res.send(201, {
        success: true,
        message: "Chatbot flow configuration saved successfully",
        id: result.id,
      });
    } catch (error) {
      console.error("Error creating config:", error);
      res.send(500, {
        error: "Failed to save configuration",
        details: error.message,
      });
    }
  },

  /**
   * Get the current chatbot flow configuration
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getConfig(req, res) {
    try {
      const config = await configService.getConfig();

      if (!config) {
        res.send(404, { error: "No configuration found" });
        return;
      }

      res.send(200, config);
    } catch (error) {
      console.error("Error retrieving config:", error);
      res.send(500, {
        error: "Failed to retrieve configuration",
        details: error.message,
      });
    }
  },
};
