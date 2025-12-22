import { useState } from "react";
import { ListGroup, Form, Button, Badge, InputGroup } from "react-bootstrap";
import { FaSearch, FaPlus, FaTimes } from "react-icons/fa";
import Loader from "../Loader";
import Message from "../Message";
import { getErrorMessage } from "../../utils/errorUtils";
import "./chatList.css";

const ChatList = ({
  conversations,
  loading,
  error,
  selectedConversation,
  onSelectConversation,
  sellers,
  loadingSellers,
  errorSellers,
  showNewChat,
  setShowNewChat,
  onStartNewChat,
  creatingConversation,
  currentUserId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const formatDate = (date) => {
    if (!date) return "";
    const messageDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - messageDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return messageDate.toLocaleDateString();
  };

  const getLastMessagePreview = (conversation) => {
    if (!conversation.lastMessage) return "No messages yet";
    const content = conversation.lastMessage.content;
    return content.length > 50 ? content.substring(0, 50) + "..." : content;
  };

  const filteredSellers = sellers.filter(
    (seller) =>
      seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="chat-list-header">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-list-header">
        <Message variant="danger">{getErrorMessage(error)}</Message>
      </div>
    );
  }

  return (
    <div className="chat-list-container">
      {/* Header */}
      <div className="chat-list-header">
        <h4>Messages</h4>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowNewChat(!showNewChat)}
        >
          {showNewChat ? <FaTimes /> : <FaPlus />}
        </Button>
      </div>

      {/* New Chat Section */}
      {showNewChat && (
        <div className="new-chat-section">
          <InputGroup className="mb-2">
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search sellers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          {loadingSellers ? (
            <Loader />
          ) : errorSellers ? (
            <Message variant="danger">{getErrorMessage(errorSellers)}</Message>
          ) : (
            <div className="sellers-list">
              {filteredSellers.length === 0 ? (
                <p className="text-muted text-center p-2">No sellers found</p>
              ) : (
                filteredSellers.map((seller) => (
                  <div
                    key={seller._id}
                    className="seller-item"
                    onClick={() => onStartNewChat(seller._id)}
                  >
                    <div className="seller-avatar">
                      {seller.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="seller-info">
                      <div className="seller-name">{seller.name}</div>
                      <div className="seller-email">{seller.email}</div>
                    </div>
                    {creatingConversation && (
                      <div className="loading-spinner">Loading...</div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Conversations List */}
      <div className="conversations-list">
        {conversations.length === 0 ? (
          <div className="no-conversations">
            <p>No conversations yet</p>
            <p className="text-muted">Start a new chat with a seller</p>
          </div>
        ) : (
          <ListGroup variant="flush">
            {conversations.map((conversation) => {
              const otherParticipant = conversation.otherParticipant;
              const isSelected =
                selectedConversation?._id === conversation._id;
              const unreadCount = conversation.unreadCount || 0;

              return (
                <ListGroup.Item
                  key={conversation._id}
                  className={`conversation-item ${isSelected ? "active" : ""}`}
                  onClick={() => onSelectConversation(conversation)}
                  action
                >
                  <div className="conversation-content">
                    <div className="conversation-avatar">
                      {otherParticipant.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="conversation-details">
                      <div className="conversation-header">
                        <span className="conversation-name">
                          {otherParticipant.name}
                        </span>
                        {conversation.lastMessageAt && (
                          <span className="conversation-time">
                            {formatDate(conversation.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      <div className="conversation-preview">
                        {getLastMessagePreview(conversation)}
                      </div>
                      {conversation.product && (
                        <div className="conversation-product">
                          About: {conversation.product.name}
                        </div>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <Badge bg="primary" className="unread-badge">
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        )}
      </div>
    </div>
  );
};

export default ChatList;

