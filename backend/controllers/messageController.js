import asyncHandle from "express-async-handler";
import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

// @desc    Create or get existing conversation between user and seller
// @route   POST /api/messages/conversations
// @access  Private
const createOrGetConversation = asyncHandle(async (req, res) => {
  const { sellerId, productId } = req.body;
  const userId = req.user._id;

  // Validate that the target user is a seller
  const seller = await User.findById(sellerId);
  if (!seller || !seller.isSeller) {
    res.status(400);
    throw new Error("Invalid seller ID or user is not a seller");
  }

  // Prevent users from messaging themselves
  if (userId.toString() === sellerId) {
    res.status(400);
    throw new Error("Cannot create conversation with yourself");
  }

  // Check if conversation already exists
  let conversation = await Conversation.findOne({
    user: userId,
    seller: sellerId,
  }).populate("user", "name email").populate("seller", "name email");

  // If conversation doesn't exist, create it
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userId, sellerId],
      user: userId,
      seller: sellerId,
      product: productId || null,
      unreadCount: new Map([
        [userId.toString(), 0],
        [sellerId.toString(), 0],
      ]),
    });

    conversation = await Conversation.findById(conversation._id)
      .populate("user", "name email")
      .populate("seller", "name email")
      .populate("product", "name image");
  } else {
    // Populate product if it exists
    if (conversation.product) {
      await conversation.populate("product", "name image");
    }
  }

  res.status(200).json(conversation);
});

// @desc    Get all conversations for the current user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = asyncHandle(async (req, res) => {
  const userId = req.user._id;

  // Get conversations where user is either the buyer or seller
  const conversations = await Conversation.find({
    $or: [{ user: userId }, { seller: userId }],
  })
    .populate("user", "name email")
    .populate("seller", "name email")
    .populate("product", "name image")
    .populate("lastMessage")
    .sort({ lastMessageAt: -1 });

  // Format response with unread counts
  const formattedConversations = conversations.map((conv) => {
    const otherParticipant =
      conv.user._id.toString() === userId.toString()
        ? conv.seller
        : conv.user;

    return {
      _id: conv._id,
      otherParticipant,
      product: conv.product,
      lastMessage: conv.lastMessage,
      lastMessageAt: conv.lastMessageAt,
      unreadCount: conv.unreadCount.get(userId.toString()) || 0,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    };
  });

  res.status(200).json(formattedConversations);
});

// @desc    Get a single conversation by ID
// @route   GET /api/messages/conversations/:id
// @access  Private
const getConversationById = asyncHandle(async (req, res) => {
  const conversationId = req.params.id;
  const userId = req.user._id;

  const conversation = await Conversation.findById(conversationId)
    .populate("user", "name email")
    .populate("seller", "name email")
    .populate("product", "name image");

  if (!conversation) {
    res.status(404);
    throw new Error("Conversation not found");
  }

  // Check if user is a participant
  const isParticipant =
    conversation.user._id.toString() === userId.toString() ||
    conversation.seller._id.toString() === userId.toString();

  if (!isParticipant) {
    res.status(403);
    throw new Error("Not authorized to access this conversation");
  }

  // Mark all messages in this conversation as read for the current user
  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: userId },
      isRead: false,
    },
    {
      isRead: true,
      readAt: new Date(),
    }
  );

  // Reset unread count for this user
  conversation.unreadCount.set(userId.toString(), 0);
  await conversation.save();

  res.status(200).json(conversation);
});

// @desc    Send a message in a conversation
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandle(async (req, res) => {
  const { conversationId, content } = req.body;
  const senderId = req.user._id;

  if (!content || !content.trim()) {
    res.status(400);
    throw new Error("Message content is required");
  }

  // Verify conversation exists and user is a participant
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    res.status(404);
    throw new Error("Conversation not found");
  }

  const isParticipant =
    conversation.user.toString() === senderId.toString() ||
    conversation.seller.toString() === senderId.toString();

  if (!isParticipant) {
    res.status(403);
    throw new Error("Not authorized to send message in this conversation");
  }

  // Create the message
  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    content: content.trim(),
  });

  // Populate sender info
  await message.populate("sender", "name email");

  // Update conversation's last message and timestamp
  conversation.lastMessage = message._id;
  conversation.lastMessageAt = new Date();

  // Increment unread count for the other participant
  const otherParticipantId =
    conversation.user.toString() === senderId.toString()
      ? conversation.seller.toString()
      : conversation.user.toString();

  const currentUnread = conversation.unreadCount.get(otherParticipantId) || 0;
  conversation.unreadCount.set(otherParticipantId, currentUnread + 1);

  await conversation.save();

  res.status(201).json(message);
});

// @desc    Get all messages in a conversation
// @route   GET /api/messages/conversations/:id/messages
// @access  Private
const getMessages = asyncHandle(async (req, res) => {
  const conversationId = req.params.id;
  const userId = req.user._id;

  // Verify conversation exists and user is a participant
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    res.status(404);
    throw new Error("Conversation not found");
  }

  const isParticipant =
    conversation.user.toString() === userId.toString() ||
    conversation.seller.toString() === userId.toString();

  if (!isParticipant) {
    res.status(403);
    throw new Error("Not authorized to access messages in this conversation");
  }

  // Get messages with pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const messages = await Message.find({ conversation: conversationId })
    .populate("sender", "name email")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  // Mark messages as read for the current user
  const unreadMessages = messages.filter(
    (msg) =>
      msg.sender._id.toString() !== userId.toString() && !msg.isRead
  );

  if (unreadMessages.length > 0) {
    await Message.updateMany(
      {
        _id: { $in: unreadMessages.map((msg) => msg._id) },
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    // Update unread count in conversation
    conversation.unreadCount.set(userId.toString(), 0);
    await conversation.save();
  }

  // Reverse to show oldest first
  messages.reverse();

  res.status(200).json({
    messages,
    page,
    limit,
    total: messages.length,
  });
});

// @desc    Get list of sellers (for starting a new conversation)
// @route   GET /api/messages/sellers
// @access  Private
const getSellers = asyncHandle(async (req, res) => {
  const sellers = await User.find({ isSeller: true })
    .select("name email")
    .sort({ name: 1 });

  res.status(200).json(sellers);
});

export {
  createOrGetConversation,
  getConversations,
  getConversationById,
  sendMessage,
  getMessages,
  getSellers,
};

