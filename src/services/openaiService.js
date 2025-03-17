import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openaiService = {
  /**
   * Detect the intent of a user message
   * @param {string} message - The user message
   * @param {Array<Object>} intents - The intent options with keywords
   * @returns {Promise<string>} - The detected intent
   */
  async detectIntent(message, intents) {
    try {
      if (!intents || !Array.isArray(intents) || intents.length === 0) {
        throw new Error("Intent options are required");
      }

      // Extract the intent names and keywords for the prompt
      const intentDetails = intents.map((intent) => ({
        intent: intent.intent,
        keywords: intent.keywords.join(", "),
      }));

      // Create the prompt for the language model
      const prompt = `
        Given the following user message: "${message}"
        
        Please determine which of the following intents best matches the user's message:
        ${intentDetails
          .map(
            (intent, index) =>
              `${index + 1}. ${intent.intent} (keywords: ${intent.keywords})`
          )
          .join("\n")}
        
        Respond with ONLY the exact name of the matching intent from the list above. 
        If none of the intents match, respond with "unknown".
      `;

      // Call the OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an intent detection assistant. Your task is to determine which predefined intent best matches a user message.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 50,
      });

      // Extract the detected intent from the response
      const detectedIntent = response.choices[0].message.content.trim();

      // Check if the detected intent is in the list of valid intents
      const validIntents = intents.map((intent) => intent.intent);
      if (validIntents.includes(detectedIntent)) {
        return detectedIntent;
      } else {
        // If the model returned something not in our list, default to "unknown"
        return "unknown";
      }
    } catch (error) {
      console.error("Error detecting intent:", error);
      // Default to "unknown" in case of an error
      return "unknown";
    }
  },
};
