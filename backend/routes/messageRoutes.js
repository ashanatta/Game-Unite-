import express from "express";
import {
  createOrGetConversation,
  getConversations,
  getConversationById,
  sendMessage,
  getMessages,
  getSellers,
  getBuyers,
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get list of sellers
router.get("/sellers", getSellers);

// Get list of buyers/users
router.get("/buyers", getBuyers);

// Conversation routes
router
  .route("/conversations")
  .post(createOrGetConversation) // Create or get conversation
  .get(getConversations); // Get all conversations for current user

router
  .route("/conversations/:id")
  .get(getConversationById); // Get single conversation

router
  .route("/conversations/:id/messages")
  .get(getMessages); // Get messages in a conversation

// Message routes
router.route("/").post(sendMessage); // Send a message

export default router;

