/**
 * Validate a chatbot flow configuration
 * @param {Object} config - The configuration to validate
 * @returns {Object} - Validation result with isValid flag and errors array
 */
export const validateConfig = (config) => {
  const errors = [];

  // Check if config is an object
  if (!config || typeof config !== "object") {
    errors.push("Configuration must be an object");
    return { isValid: false, errors };
  }

  // Check if blocks array exists and is not empty
  if (
    !config.blocks ||
    !Array.isArray(config.blocks) ||
    config.blocks.length === 0
  ) {
    errors.push("Configuration must contain a non-empty blocks array");
    return { isValid: false, errors };
  }

  // Check if initialBlock is defined
  if (!config.initialBlock) {
    errors.push("Configuration must specify an initialBlock");
    return { isValid: false, errors };
  }

  // Check if initialBlock exists in blocks
  const initialBlockExists = config.blocks.some(
    (block) => block.id === config.initialBlock
  );
  if (!initialBlockExists) {
    errors.push(
      `Initial block with ID ${config.initialBlock} not found in blocks array`
    );
  }

  // Validate each block
  const blockIds = new Set();

  for (const block of config.blocks) {
    // Check if block has an ID
    if (!block.id) {
      errors.push("Each block must have an ID");
      continue;
    }

    // Check for duplicate block IDs
    if (blockIds.has(block.id)) {
      errors.push(`Duplicate block ID: ${block.id}`);
    } else {
      blockIds.add(block.id);
    }

    // Check if block has a type
    if (!block.type) {
      errors.push(`Block ${block.id} must have a type`);
      continue;
    }

    // Validate block based on its type
    switch (block.type) {
      case "message":
        if (!block.message) {
          errors.push(
            `Block ${block.id} of type message must have a message property`
          );
        }
        break;

      case "wait":
        if (!block.next) {
          errors.push(
            `Block ${block.id} of type wait must have a next property`
          );
        }
        break;

      case "detect_intent":
        if (
          !block.intents ||
          !Array.isArray(block.intents) ||
          block.intents.length === 0
        ) {
          errors.push(
            `Block ${block.id} of type detect_intent must have a non-empty intents array`
          );
        } else {
          // Validate intents
          for (const intent of block.intents) {
            if (!intent.intent) {
              errors.push(
                `Intent in block ${block.id} must have an intent property`
              );
            }

            if (
              !intent.keywords ||
              !Array.isArray(intent.keywords) ||
              intent.keywords.length === 0
            ) {
              errors.push(
                `Intent in block ${block.id} must have a non-empty keywords array`
              );
            }

            if (!intent.next) {
              errors.push(
                `Intent in block ${block.id} must have a next property`
              );
            }
          }
        }

        if (!block.fallback) {
          errors.push(
            `Block ${block.id} of type detect_intent must have a fallback property`
          );
        }
        break;

      default:
        errors.push(
          `Unsupported block type: ${block.type}. Supported types are: message, wait, detect_intent`
        );
    }
  }

  // Validate block references
  for (const block of config.blocks) {
    // Check next references
    if (block.next && !blockIds.has(block.next)) {
      errors.push(
        `Block ${block.id} references non-existent next block: ${block.next}`
      );
    }

    // Check fallback references
    if (block.fallback && !blockIds.has(block.fallback)) {
      errors.push(
        `Block ${block.id} references non-existent fallback block: ${block.fallback}`
      );
    }

    // Check intent next references
    if (block.intents && Array.isArray(block.intents)) {
      for (const intent of block.intents) {
        if (intent.next && !blockIds.has(intent.next)) {
          errors.push(
            `Intent ${intent.intent} in block ${block.id} references non-existent next block: ${intent.next}`
          );
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
