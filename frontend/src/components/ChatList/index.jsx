import { useState } from "react";
import { ListGroup, Form, Button, Badge, InputGroup, Modal } from "react-bootstrap";
import { FaPlus, FaSearch } from "react-icons/fa";
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
  isUserSeller = false,
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

  const filteredPeople = sellers.filter(
    (person) =>
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email.toLowerCase().includes(searchTerm.toLowerCase())
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
          onClick={() => setShowNewChat(true)}
          className="new-chat-button"
        >
          <FaPlus style={{ fontSize: '14px', marginRight: '4px' }} />
          New Chat
        </Button>
      </div>

      {/* New Chat Modal */}
      <Modal show={showNewChat} onHide={() => setShowNewChat(false)}>
        <Modal.Header closeButton>
          <Modal.Title>New Chat with {isUserSeller ? "Buyer" : "Seller"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <InputGroup.Text>
              <FaSearch style={{ fontSize: '16px' }} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder={`Search ${isUserSeller ? "buyers" : "sellers"}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          {loadingSellers ? (
            <Loader />
          ) : errorSellers ? (
            <Message variant="danger">{getErrorMessage(errorSellers)}</Message>
          ) : (
            <div className="sellers-list-modal">
              {filteredPeople.length === 0 ? (
                <p className="text-muted text-center p-2">
                  No {isUserSeller ? "buyers" : "sellers"} found
                </p>
              ) : (
                filteredPeople.map((person) => (
                  <div
                    key={person._id}
                    className="seller-item"
                    onClick={() => onStartNewChat(person._id)}
                  >
                    <div className="seller-avatar">
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="seller-info">
                      <div className="seller-name">{person.name}</div>
                      <div className="seller-email">{person.email}</div>
                    </div>
                    {creatingConversation && (
                      <div className="loading-spinner">Loading...</div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>

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

