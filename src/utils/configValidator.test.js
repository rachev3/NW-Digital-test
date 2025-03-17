import { validateConfig } from "./configValidator.js";

describe("Config Validator", () => {
  test("should validate a valid configuration", () => {
    const validConfig = {
      blocks: [
        {
          id: "welcome",
          type: "message",
          message: "Welcome to our chatbot!",
          next: "wait_for_intent",
        },
        {
          id: "wait_for_intent",
          type: "wait",
          next: "unknown_intent",
        },
        {
          id: "unknown_intent",
          type: "message",
          message: "I did not understand that.",
        },
      ],
      initialBlock: "welcome",
    };

    const result = validateConfig(validConfig);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("should reject a configuration without blocks", () => {
    const invalidConfig = {
      initialBlock: "welcome",
    };

    const result = validateConfig(invalidConfig);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Configuration must contain a non-empty blocks array"
    );
  });

  test("should reject a configuration with an invalid initial block", () => {
    const invalidConfig = {
      blocks: [
        {
          id: "welcome",
          type: "message",
          message: "Welcome to our chatbot!",
        },
      ],
      initialBlock: "non_existent_block",
    };

    const result = validateConfig(invalidConfig);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Initial block with ID non_existent_block not found in blocks array"
    );
  });

  test("should reject a configuration with invalid block references", () => {
    const invalidConfig = {
      blocks: [
        {
          id: "welcome",
          type: "message",
          message: "Welcome to our chatbot!",
          next: "non_existent_block",
        },
      ],
      initialBlock: "welcome",
    };

    const result = validateConfig(invalidConfig);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Block welcome references non-existent next block: non_existent_block"
    );
  });

  test("should validate a configuration with intent detection", () => {
    const validConfig = {
      blocks: [
        {
          id: "welcome",
          type: "message",
          message: "Welcome to our chatbot!",
          next: "wait_for_intent",
        },
        {
          id: "wait_for_intent",
          type: "wait",
          next: "detect_intent",
        },
        {
          id: "detect_intent",
          type: "detect_intent",
          intents: [
            {
              intent: "weather",
              keywords: ["weather", "forecast", "temperature"],
              next: "weather_response",
            },
            {
              intent: "travel",
              keywords: ["travel", "vacation", "trip"],
              next: "travel_response",
            },
          ],
          fallback: "unknown_intent",
        },
        {
          id: "weather_response",
          type: "message",
          message: "Here is the weather.",
        },
        {
          id: "travel_response",
          type: "message",
          message: "Here are some travel options.",
        },
        {
          id: "unknown_intent",
          type: "message",
          message: "I did not understand that.",
        },
      ],
      initialBlock: "welcome",
    };

    const result = validateConfig(validConfig);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("should reject a configuration with missing intent properties", () => {
    const invalidConfig = {
      blocks: [
        {
          id: "welcome",
          type: "message",
          message: "Welcome to our chatbot!",
          next: "detect_intent",
        },
        {
          id: "detect_intent",
          type: "detect_intent",
          intents: [
            {
              intent: "weather",
              // Missing keywords
              next: "weather_response",
            },
          ],
          fallback: "unknown_intent",
        },
        {
          id: "weather_response",
          type: "message",
          message: "Here is the weather.",
        },
        {
          id: "unknown_intent",
          type: "message",
          message: "I did not understand that.",
        },
      ],
      initialBlock: "welcome",
    };

    const result = validateConfig(invalidConfig);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Intent in block detect_intent must have a non-empty keywords array"
    );
  });
});
