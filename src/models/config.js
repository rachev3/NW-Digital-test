import mongoose from "mongoose";

const intentSchema = new mongoose.Schema({
  intent: { type: String, required: true },
  keywords: { type: [String], required: true },
  next: { type: String, required: true }, // Reference to the next block ID
});

const blockSchema = new mongoose.Schema({
  id: { type: String, required: true }, // Unique ID for the block
  type: {
    type: String,
    enum: ["message", "wait", "detect_intent"],
    required: true,
  },
  message: { type: String }, // Only used if type = 'message'
  intents: { type: [intentSchema] }, // Only used if type = 'detect_intent'
  fallback: { type: String }, // Used for intent detection failure
  next: { type: String }, // Reference to the next block ID
});

const configSchema = new mongoose.Schema(
  {
    blocks: {
      type: [blockSchema],
      required: true,
      validate: {
        validator: function (blocks) {
          return Array.isArray(blocks) && blocks.length > 0;
        },
        message: "Blocks must be a non-empty array",
      },
    },
    initialBlock: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return this.blocks.some((block) => block.id === value);
        },
        message: "InitialBlock must match an existing block ID",
      },
    },
    metadata: {
      version: { type: String, default: "1.0" },
      description: { type: String, default: "" },
    },
  },
  { timestamps: true } // Automatically creates createdAt and updatedAt fields
);

// Create a model from the schema
export const Config = mongoose.model("Config", configSchema);
