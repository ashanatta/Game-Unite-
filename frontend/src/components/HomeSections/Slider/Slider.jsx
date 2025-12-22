import "./slider.css";
import { useState } from "react";
import { useUpdateUserMutation } from "../../../slices/usersApiSlice";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Nav, Modal, Form, InputGroup, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { FaComments, FaSearch } from "react-icons/fa";
import { LinkContainer } from "react-router-bootstrap";
import {
  useGetSellersQuery,
  useGetBuyersQuery,
  useCreateOrGetConversationMutation,
} from "../../../slices/messagesApiSlice";
import Loader from "../../Loader";
import Message from "../../Message";
import { getErrorMessage } from "../../../utils/errorUtils";

const Slider = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const navigate = useNavigate();

  const [updateUser] = useUpdateUserMutation();

  const [isSeller, setIsSeller] = useState("false");
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const isUserSeller = userInfo?.isSeller;

  // Fetch sellers if user is not a seller, fetch buyers if user is a seller
  const {
    data: sellers,
    isLoading: loadingSellers,
    error: errorSellers,
  } = useGetSellersQuery(undefined, {
    skip: !showMessagesModal || isUserSeller,
  });

  const {
    data: buyers,
    isLoading: loadingBuyers,
    error: errorBuyers,
  } = useGetBuyersQuery(undefined, {
    skip: !showMessagesModal || !isUserSeller,
  });

  const [createOrGetConversation, { isLoading: creatingConversation }] =
    useCreateOrGetConversationMutation();

  const handleBecomeSeller = async () => {
    if (!userInfo) {
      // Redirect user to login if not logged in
      navigate("/login");
      return;
    }

    try {
      // Optimistically update UI
      setIsSeller(true);

      // Call the updateUser mutation function with the user ID and updated isSeller property
      await updateUser({ userId: userInfo._id, isSeller: true });

      toast.success("congrats! you are now a seller. login again");

      console.log("User is now a seller!");
    } catch (error) {
      // Handle any errors here
      console.error("Error updating user:", error.message);

      // Revert UI update on error
      setIsSeller(false);
    }
  };

  const peopleToShow = isUserSeller ? buyers : sellers;
  const loadingPeople = isUserSeller ? loadingBuyers : loadingSellers;
  const errorPeople = isUserSeller ? errorBuyers : errorSellers;

  const filteredPeople = (peopleToShow || []).filter(
    (person) =>
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartNewChat = async (targetId) => {
    if (!userInfo) {
      navigate("/login");
      return;
    }
    try {
      // If user is seller, pass userId. If user is regular, pass sellerId
      const data = isUserSeller
        ? { userId: targetId }
        : { sellerId: targetId };
      const result = await createOrGetConversation(data).unwrap();
      setShowMessagesModal(false);
      navigate("/messages");
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to start conversation");
    }
  };

  const handleOpenMessages = () => {
    if (!userInfo) {
      navigate("/login");
      return;
    }
    setShowMessagesModal(true);
  };

  return (
    <div className="slider__section" style={{ marginTop: "-20px" }}>
      <div className="slider__head">
        <div className="heading">
          <h1>Connect with gamers.</h1>
          <h1>Leading marketplace all around the world.</h1>
          <p>Secure trades and transactions.</p>
        </div>
        {!userInfo?.isSeller && !userInfo?.isAdmin && (
          <Nav.Link onClick={handleBecomeSeller} style={{ marginTop: "8px" }}>
            <button className="heading__btn">Become a Seller</button>
          </Nav.Link>
        )}
      </div>
      <div className="messages-icon-link" onClick={handleOpenMessages}>
        <FaComments className="messages-icon" />
      </div>

      {/* Messages Modal */}
      <Modal
        show={showMessagesModal}
        onHide={() => {
          setShowMessagesModal(false);
          setSearchTerm("");
        }}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Messages</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <LinkContainer to="/messages">
              <Button variant="primary" className="w-100 mb-3">
                View All Messages
              </Button>
            </LinkContainer>
          </div>
          <h6 className="mb-3">
            Start New Chat with {isUserSeller ? "Buyers" : "Sellers"}
          </h6>
          <InputGroup className="mb-3">
            <InputGroup.Text>
              <FaSearch style={{ fontSize: "16px" }} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder={`Search ${isUserSeller ? "buyers" : "sellers"}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          {loadingPeople ? (
            <Loader />
          ) : errorPeople ? (
            <Message variant="danger">{getErrorMessage(errorPeople)}</Message>
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
                    onClick={() => handleStartNewChat(person._id)}
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
    </div>
  );
};

export default Slider;
