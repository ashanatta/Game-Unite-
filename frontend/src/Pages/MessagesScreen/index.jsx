import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import {
  useGetConversationsQuery,
  useGetSellersQuery,
  useCreateOrGetConversationMutation,
  useGetConversationByIdQuery,
} from "../../slices/messagesApiSlice";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import ChatList from "../../components/ChatList";
import ChatWindow from "../../components/ChatWindow";
import { getErrorMessage } from "../../utils/errorUtils";
import "./messages.css";

const MessagesScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);

  const {
    data: conversations,
    isLoading: loadingConversations,
    error: errorConversations,
    refetch: refetchConversations,
  } = useGetConversationsQuery();

  const {
    data: sellers,
    isLoading: loadingSellers,
    error: errorSellers,
  } = useGetSellersQuery();

  const [createOrGetConversation, { isLoading: creatingConversation }] =
    useCreateOrGetConversationMutation();

  const handleSelectConversation = (conversation) => {
    // If conversation has otherParticipant (from list), we'll let ChatWindow fetch full details
    // Otherwise, use it directly
    setSelectedConversation(conversation);
    setShowNewChat(false);
  };

  const handleStartNewChat = async (sellerId) => {
    try {
      const result = await createOrGetConversation({ sellerId }).unwrap();
      setSelectedConversation(result);
      setShowNewChat(false);
      refetchConversations();
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  return (
    <Container fluid className="messages-container">
      <Row className="h-100">
        {/* Chat List Sidebar */}
        <Col md={4} className="chat-list-col p-0">
          <ChatList
            conversations={conversations || []}
            loading={loadingConversations}
            error={errorConversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            sellers={sellers || []}
            loadingSellers={loadingSellers}
            errorSellers={errorSellers}
            showNewChat={showNewChat}
            setShowNewChat={setShowNewChat}
            onStartNewChat={handleStartNewChat}
            creatingConversation={creatingConversation}
            currentUserId={userInfo?._id}
          />
        </Col>

        {/* Chat Window */}
        <Col md={8} className="chat-window-col p-0">
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              currentUserId={userInfo?._id}
              onConversationUpdate={refetchConversations}
            />
          ) : (
            <div className="no-chat-selected">
              <div className="text-center">
                <h3>Select a conversation to start messaging</h3>
                <p>Or start a new chat with a seller</p>
              </div>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default MessagesScreen;

