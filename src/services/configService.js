import { Config } from "../models/config.js";
import { validateConfig } from "../utils/configValidator.js";

export const configService = {
  /**
   * Save a new chatbot flow configuration
   * @param {Object} configData - The configuration data to save
   * @returns {Promise<Object>} - The saved configuration
   */
  async saveConfig(configData) {
    try {
      // Validate the configuration
      const validationResult = validateConfig(configData);

      if (!validationResult.isValid) {
        throw new Error(
          `Invalid configuration: ${validationResult.errors.join(", ")}`
        );
      }

      // Check if a configuration already exists
      const existingConfig = await Config.findOne();

      if (existingConfig) {
        // Update the existing configuration
        existingConfig.blocks = configData.blocks;
        existingConfig.initialBlock = configData.initialBlock;
        existingConfig.metadata =
          configData.metadata || existingConfig.metadata;
        existingConfig.updatedAt = new Date();

        await existingConfig.save();
        return existingConfig;
      } else {
        // Create a new configuration
        const newConfig = new Config({
          blocks: configData.blocks,
          initialBlock: configData.initialBlock,
          metadata: configData.metadata || {},
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await newConfig.save();
        return newConfig;
      }
    } catch (error) {
      console.error("Error saving configuration:", error);
      throw error;
    }
  },

  /**
   * Get the current chatbot flow configuration
   * @returns {Promise<Object|null>} - The current configuration or null if none exists
   */
  async getConfig() {
    try {
      // Get the most recent configuration
      const config = await Config.findOne().sort({ updatedAt: -1 });
      return config;
    } catch (error) {
      console.error("Error retrieving configuration:", error);
      throw error;
    }
  },
};
