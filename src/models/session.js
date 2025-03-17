import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  direction: {
    type: String,
    enum: ["incoming", "outgoing"],
    required: true,
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  blockId: {
    type: String,
    required: false,
  },
});

const sessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    currentBlockId: {
      type: String,
      required: false,
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

// Create a model from the schema
export const Session = mongoose.model("Session", sessionSchema);
