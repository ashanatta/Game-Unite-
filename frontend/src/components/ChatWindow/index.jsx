import { useState, useEffect, useRef } from "react";
import { Form, Button, Container } from "react-bootstrap";
import { FaPaperPlane } from "react-icons/fa";
import {
  useGetMessagesQuery,
  useSendMessageMutation,
  useGetConversationByIdQuery,
} from "../../slices/messagesApiSlice";
import Loader from "../Loader";
import Message from "../Message";
import { getErrorMessage } from "../../utils/errorUtils";
import "./chatWindow.css";

const ChatWindow = ({ conversation, currentUserId, onConversationUpdate }) => {
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Extract conversation ID
  const conversationId = conversation?._id || conversation;
  const hasFullConversation = 
    typeof conversation === "object" && 
    conversation?._id && 
    conversation?.user && 
    conversation?.seller;

  // If conversation only has otherParticipant (from list), fetch full details
  const needsFullDetails = 
    conversation?.otherParticipant && 
    !conversation?.user && 
    !conversation?.seller;

  // Get conversation details if needed
  const {
    data: conversationData,
    isLoading: loadingConversation,
  } = useGetConversationByIdQuery(conversationId, {
    skip: !conversationId || hasFullConversation || !needsFullDetails,
  });

  const actualConversation = hasFullConversation 
    ? conversation 
    : needsFullDetails 
    ? conversationData 
    : conversation;

  const {
    data: messagesData,
    isLoading: loadingMessages,
    error: errorMessages,
    refetch: refetchMessages,
  } = useGetMessagesQuery(
    { conversationId },
    { skip: !conversationId }
  );

  const [sendMessage, { isLoading: sendingMessage }] = useSendMessageMutation();

  const messages = messagesData?.messages || [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Refetch messages periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refetchMessages();
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [refetchMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || sendingMessage) return;

    try {
      await sendMessage({
        conversationId,
        content: messageText.trim(),
      }).unwrap();
      setMessageText("");
      refetchMessages();
      if (onConversationUpdate) {
        onConversationUpdate();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    if (!date) return "";
    const messageDate = new Date(date);
    const now = new Date();
    const isToday =
      messageDate.getDate() === now.getDate() &&
      messageDate.getMonth() === now.getMonth() &&
      messageDate.getFullYear() === now.getFullYear();

    if (isToday) return "Today";
    return messageDate.toLocaleDateString();
  };

  // Show loader if we're fetching full conversation details
  if (loadingConversation && needsFullDetails) {
    return (
      <div className="chat-window-container">
        <Loader />
      </div>
    );
  }

  // If we still don't have conversation data, show error
  if (!actualConversation || !conversationId) {
    return (
      <div className="chat-window-container">
        <Message variant="danger">Conversation not found</Message>
      </div>
    );
  }

  // Handle both formats: conversations from list have 'otherParticipant', 
  // while full conversations have 'user' and 'seller'
  let otherParticipant;
  if (actualConversation.otherParticipant) {
    // Format from getConversations (list view)
    otherParticipant = actualConversation.otherParticipant;
  } else if (actualConversation.user && actualConversation.seller) {
    // Format from getConversationById or createOrGetConversation
    otherParticipant =
      actualConversation.user._id.toString() === currentUserId
        ? actualConversation.seller
        : actualConversation.user;
  } else {
    // Fallback - shouldn't happen but handle gracefully
    return (
      <div className="chat-window-container">
        <Message variant="danger">Invalid conversation data</Message>
      </div>
    );
  }

  return (
    <div className="chat-window-container">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-header-avatar">
            {otherParticipant.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="chat-header-name">{otherParticipant.name}</div>
            <div className="chat-header-email">{otherParticipant.email}</div>
          </div>
        </div>
        {actualConversation.product && actualConversation.product.name && (
          <div className="chat-header-product">
            About: {actualConversation.product.name}
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="chat-messages" ref={chatContainerRef}>
        {loadingMessages ? (
          <Loader />
        ) : errorMessages ? (
          <Message variant="danger">{getErrorMessage(errorMessages)}</Message>
        ) : messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message, index) => {
              const isOwnMessage =
                message.sender?._id?.toString() === currentUserId;
              const showDate =
                index === 0 ||
                new Date(message.createdAt).toDateString() !==
                  new Date(messages[index - 1].createdAt).toDateString();

              return (
                <div key={message._id}>
                  {showDate && (
                    <div className="message-date-divider">
                      {formatDate(message.createdAt)}
                    </div>
                  )}
                  <div
                    className={`message-item ${
                      isOwnMessage ? "message-own" : "message-other"
                    }`}
                  >
                    <div className="message-content">
                      <div className="message-text">{message.content}</div>
                      <div className="message-time">
                        {formatTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <Form onSubmit={handleSubmit} className="chat-form">
          <Form.Group className="d-flex">
            <Form.Control
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={sendingMessage}
              className="chat-input"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!messageText.trim() || sendingMessage}
              className="send-button"
            >
              <FaPaperPlane />
            </Button>
          </Form.Group>
        </Form>
      </div>
    </div>
  );
};

export default ChatWindow;

