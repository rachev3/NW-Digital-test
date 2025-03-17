import { openaiService } from "./openaiService.js";
import { historyService } from "./historyService.js";

// Store session states
const sessionStates = new Map();

export const chatbotService = {
  /**
   * Start a new chatbot flow
   * @param {Object} config - The chatbot configuration
   * @param {string} sessionId - The session ID
   * @returns {Promise<Object>} - The initial response
   */
  async startFlow(config, sessionId) {
    try {
      // Get the initial block
      const initialBlockId = config.initialBlock;
      const initialBlock = config.blocks.find(
        (block) => block.id === initialBlockId
      );

      if (!initialBlock) {
        throw new Error(`Initial block with ID ${initialBlockId} not found`);
      }

      // Create or get the session
      await historyService.getOrCreateSession(sessionId);

      // Update the current block in the session
      await historyService.updateCurrentBlock(sessionId, initialBlockId);

      // Process the initial block
      return await this.processBlock(initialBlock, sessionId, config);
    } catch (error) {
      console.error("Error starting flow:", error);
      throw error;
    }
  },

  /**
   * Process an incoming message
   * @param {Object} message - The incoming message
   * @param {Object} config - The chatbot configuration
   * @param {string} sessionId - The session ID
   * @returns {Promise<Object>} - The response
   */
  async processMessage(message, config, sessionId) {
    try {
      // Get the session
      const session = await historyService.getSession(sessionId);

      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // Add the message to the session
      await historyService.addMessage({
        sessionId,
        direction: "incoming",
        content: message.text || JSON.stringify(message),
      });

      // Get the current block
      const currentBlockId = session.currentBlockId;
      const currentBlock = config.blocks.find(
        (block) => block.id === currentBlockId
      );

      if (!currentBlock) {
        throw new Error(`Block with ID ${currentBlockId} not found`);
      }

      // Process the message based on the current block type
      if (currentBlock.type === "wait") {
        // Get the next block ID
        const nextBlockId = currentBlock.next;

        if (!nextBlockId) {
          throw new Error(
            `Block ${currentBlockId} does not have a next block defined`
          );
        }

        // Get the next block
        const nextBlock = config.blocks.find(
          (block) => block.id === nextBlockId
        );

        if (!nextBlock) {
          throw new Error(`Next block with ID ${nextBlockId} not found`);
        }

        // Update the current block in the session
        await historyService.updateCurrentBlock(sessionId, nextBlockId);

        // Process the next block
        return await this.processBlock(nextBlock, sessionId, config, message);
      } else if (currentBlock.type === "detect_intent") {
        // Use OpenAI to detect the intent
        const userMessage = message.text || JSON.stringify(message);
        const detectedIntent = await openaiService.detectIntent(
          userMessage,
          currentBlock.intents.map((intent) => ({
            intent: intent.intent,
            keywords: intent.keywords,
          }))
        );

        console.log("Detected intent:", detectedIntent);

        // Find the matching intent
        const matchingIntent = currentBlock.intents.find(
          (intent) => intent.intent === detectedIntent
        );

        // Get the next block ID
        let nextBlockId;

        if (matchingIntent) {
          nextBlockId = matchingIntent.next;
        } else {
          // Use fallback if no intent matches
          nextBlockId = currentBlock.fallback;

          if (!nextBlockId) {
            throw new Error(
              `Block ${currentBlockId} does not have a fallback defined`
            );
          }
        }

        // Get the next block
        const nextBlock = config.blocks.find(
          (block) => block.id === nextBlockId
        );

        if (!nextBlock) {
          throw new Error(`Next block with ID ${nextBlockId} not found`);
        }

        // Update the current block in the session
        await historyService.updateCurrentBlock(sessionId, nextBlockId);

        // Process the next block
        return await this.processBlock(nextBlock, sessionId, config);
      } else {
        // We received a message but we're not in a wait or detect_intent block
        return {
          type: "error",
          message: "Unexpected message received",
        };
      }
    } catch (error) {
      console.error("Error processing message:", error);
      throw error;
    }
  },

  /**
   * Process a block in the chatbot flow
   * @param {Object} block - The block to process
   * @param {string} sessionId - The session ID
   * @param {Object} config - The chatbot configuration
   * @param {Object} userMessage - The user message (if available)
   * @returns {Promise<Object>} - The response
   */
  async processBlock(block, sessionId, config, userMessage = null) {
    try {
      // Process the block based on its type
      switch (block.type) {
        case "message":
          // Add the message to the session
          await historyService.addMessage({
            sessionId,
            direction: "outgoing",
            content: block.message,
            blockId: block.id,
          });

          // If there's a next block, process it but ONLY if it's not a wait or detect_intent
          if (block.next) {
            // Get the next block
            const nextBlock = config.blocks.find((b) => b.id === block.next);

            if (!nextBlock) {
              throw new Error(`Next block with ID ${block.next} not found`);
            }

            // Update the current block in the session
            await historyService.updateCurrentBlock(sessionId, block.next);

            // If next block is wait or detect_intent, don't process it immediately
            // This ensures the message is sent to the client first
            if (
              nextBlock.type === "wait" ||
              nextBlock.type === "detect_intent"
            ) {
              return {
                type: "message",
                message: block.message,
              };
            }

            // Process the next block (only for non-interactive blocks)
            return await this.processBlock(nextBlock, sessionId, config);
          }

          // Return the message
          return {
            type: "message",
            message: block.message,
          };

        case "wait":
          // Update the current block in the session
          await historyService.updateCurrentBlock(sessionId, block.id);
          console.log("it is in wait block");
          // Return a prompt for the user
          return {
            type: "prompt",
            message: "Please respond...",
          };

        case "detect_intent":
          // If we have a user message and we're in detect_intent block, process it immediately
          if (userMessage) {
            const userText = userMessage.text || JSON.stringify(userMessage);
            const detectedIntent = await openaiService.detectIntent(
              userText,
              block.intents.map((intent) => ({
                intent: intent.intent,
                keywords: intent.keywords,
              }))
            );

            console.log("Directly detected intent:", detectedIntent);

            // Find the matching intent
            const matchingIntent = block.intents.find(
              (intent) => intent.intent === detectedIntent
            );

            // Get the next block ID
            let nextBlockId;

            if (matchingIntent) {
              nextBlockId = matchingIntent.next;
            } else {
              // Use fallback if no intent matches
              nextBlockId = block.fallback;
            }

            // Get the next block
            const nextBlock = config.blocks.find(
              (block) => block.id === nextBlockId
            );

            if (!nextBlock) {
              throw new Error(`Next block with ID ${nextBlockId} not found`);
            }

            // Update the current block in the session
            await historyService.updateCurrentBlock(sessionId, nextBlockId);

            // Process the next block
            return await this.processBlock(nextBlock, sessionId, config);
          }

          // Update the current block in the session
          await historyService.updateCurrentBlock(sessionId, block.id);
          console.log("it is in detect_intent block");
          // Return a prompt for the user
          return {
            type: "prompt",
            message: "Please respond...",
          };

        default:
          throw new Error(`Unsupported block type: ${block.type}`);
      }
    } catch (error) {
      console.error("Error processing block:", error);
      throw error;
    }
  },
};
