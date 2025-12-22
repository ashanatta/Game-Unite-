import { LinkContainer } from "react-router-bootstrap";
import { Table, Button, Row, Col, Container } from "react-bootstrap";
import { useSelector } from "react-redux";
import { FaTimes, FaComments } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { useGetMyOrdersQuery } from "../../slices/ordersApiSlice";
import { useGetUserProductsQuery } from "../../slices/productsApiSlice";
import { useCreateOrGetConversationMutation } from "../../slices/messagesApiSlice";
import { useState, useEffect } from "react";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import Product from "../../components/Products/Products.jsx";
import { toast } from "react-toastify";
import "./style.css";

const UserProfilePage = () => {
  const { id: userId } = useParams();
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const {
    data: orders,
    isLoading: loadingOrders,
    error: errorOrders,
  } = useGetMyOrdersQuery(userId);

  const {
    data: products,
    isLoading: loadingProducts,
    error: errorProducts,
  } = useGetUserProductsQuery(userId);

  const [createOrGetConversation, { isLoading: creatingConversation }] =
    useCreateOrGetConversationMutation();

  const [name, setName] = useState("");
  const [profileUser, setProfileUser] = useState(null);

  useEffect(() => {
    if (userInfo && userInfo._id === userId) {
      setName(userInfo.name);
      setProfileUser(userInfo);
    } else if (products && products.length > 0) {
      setName(products[0].user.name);
      setProfileUser(products[0].user);
    }
  }, [userInfo, userId, products]);

  const handleMessage = async () => {
    if (!userInfo) {
      navigate("/login");
      return;
    }

    if (userInfo._id === userId) {
      toast.info("You cannot message yourself");
      return;
    }

    if (!profileUser) {
      toast.error("User information not available");
      return;
    }

    try {
      const isProfileSeller = profileUser?.isSeller;
      const isCurrentUserSeller = userInfo?.isSeller;

      // Allow messaging if one is seller and other is not
      if (isProfileSeller && !isCurrentUserSeller) {
        // Regular user messaging seller
        const result = await createOrGetConversation({ sellerId: userId }).unwrap();
        navigate("/messages");
      } else if (!isProfileSeller && isCurrentUserSeller) {
        // Seller messaging regular user
        const result = await createOrGetConversation({ userId: userId }).unwrap();
        navigate("/messages");
      } else {
        toast.error("You can only message sellers or be messaged by sellers");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error(
        error?.data?.message || "Failed to start conversation"
      );
    }
  };

  return (
    <Container className="overflow-x">
      <Row>
        <Col md={12}>
          <div className="profile-pattern">
            <div className="profile-img"></div>
            <div className="user-name-container">
              <div className="user-name-wrapper">
                <h2 className="user-name">{name}</h2>
                {userInfo &&
                  userInfo._id !== userId &&
                  profileUser &&
                  ((profileUser.isSeller && !userInfo.isSeller) ||
                    (!profileUser.isSeller && userInfo.isSeller)) && (
                    <button
                      className="message-icon-button"
                      onClick={handleMessage}
                      disabled={creatingConversation}
                      title="Message"
                    >
                      <FaComments />
                    </button>
                  )}
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <h2>My Products</h2>
          {loadingProducts ? (
            <Loader />
          ) : errorProducts ? (
            <Message variant="danger">
              {errorProducts?.data?.message || errorProducts.error}
            </Message>
          ) : (
            <Row>
              {products.map((product) => (
                <Col key={product._id} sm={6} md={6} lg={4} xl={3}>
                  <Product product={product} />
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfilePage;
