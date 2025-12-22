import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
    ],
    // The user who initiated the conversation (buyer)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    // The seller in the conversation
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    // Optional: Link to a product if conversation is about a product
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Genre",
      default: null,
    },
    // Track last message for sorting
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    // Track unread messages for each participant
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ user: 1, seller: 1 });

// Ensure one conversation per user-seller pair (sparse index to allow null values)
conversationSchema.index(
  { user: 1, seller: 1 },
  { unique: true, sparse: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;

