import { useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  Form,
  Row,
  Col,
  Card,
  Image,
  ListGroup,
  Button,
  Container,
  Badge,
} from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import { useSelector } from "react-redux";
import Meta from "../../components/Meta/Meta";
import Loader from "../../components/Loader";
import Message from "../../components/Message";

import {
  useGetBlogDetailsQuery,
  useCreateBlogReviewMutation,
} from "../../slices/blogsApiSlice";

import { toast } from "react-toastify";
import BlogContent from "../../components/BlogContent";
import { getErrorMessage } from "../../utils/errorUtils";
import "./blogDetail.css";

const BlogScreen = () => {
  const { id: blogId } = useParams();

  const [comment, setComment] = useState("");

  const { userInfo } = useSelector((state) => state.auth);

  const {
    data: blog,
    isLoading,
    error,
    refetch,
  } = useGetBlogDetailsQuery(blogId);

  const [createBlogReview, { isLoading: loadingBlogReview }] =
    useCreateBlogReviewMutation();

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await createBlogReview({
        blogId,
        comment,
      }).unwrap();
      refetch();
      toast.success("Comment submitted successfully!");
      setComment("");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <Container className="blog-detail-container">
        <div className="blog-back-button">
          <Link to="/blog" className="btn-back">
            <FaArrowLeft /> Back to Blogs
          </Link>
        </div>

        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{getErrorMessage(error)}</Message>
        ) : (
          <>
            <Meta title={blog.name} />
            
            {/* Blog Header Section */}
            <Card className="blog-header-card">
              <div className="blog-image-wrapper">
                <Image 
                  src={blog.image} 
                  alt={blog.name} 
                  className="blog-main-image"
                  loading="eager"
                  decoding="async"
                />
              </div>
              <Card.Body className="blog-header-content">
                <div className="blog-title-section">
                  <h1 className="blog-title">{blog.name}</h1>
                  {blog.category && blog.category.length > 0 && (
                    <div className="blog-categories">
                      {Array.isArray(blog.category) ? (
                        blog.category.map((cat, idx) => (
                          <Badge key={idx} bg="primary" className="category-badge">
                            {cat}
                          </Badge>
                        ))
                      ) : (
                        <Badge bg="primary" className="category-badge">
                          {blog.category}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>

            {/* Blog Content Section */}
            <Card className="blog-content-card">
              <Card.Body>
                <h2 className="content-title">Article Content</h2>
                <div className="blog-description">
                  <BlogContent content={blog.description} />
                </div>
              </Card.Body>
            </Card>

            {/* Comments Section */}
            <Card className="blog-comments-card">
              <Card.Body>
                <div className="comments-header">
                  <h2 className="comments-title">
                    Comments ({blog.reviews?.length || 0})
                  </h2>
                </div>

                {blog.reviews && blog.reviews.length === 0 ? (
                  <Message className="no-comments-message">
                    No comments yet. Be the first to share your thoughts!
                  </Message>
                ) : (
                  <div className="comments-list">
                    {blog.reviews?.map((review) => (
                      <Card key={review._id} className="comment-card">
                        <Card.Body>
                          <div className="comment-header">
                            <div className="comment-author">
                              <div className="author-avatar">
                                {review.name?.charAt(0).toUpperCase() || "U"}
                              </div>
                              <div className="author-info">
                                <strong className="author-name">
                                  {review.name || "Anonymous"}
                                </strong>
                                <span className="comment-date">
                                  {formatDate(review.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="comment-text">
                            {review.comment}
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Comment Form */}
                <Card className="comment-form-card">
                  <Card.Body>
                    <h3 className="comment-form-title">Write a Comment</h3>

                    {loadingBlogReview && <Loader />}

                    {userInfo ? (
                      <Form onSubmit={submitHandler} className="comment-form">
                        <Form.Group className="mb-3" controlId="comment">
                          <Form.Label>Your Comment</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            required
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your thoughts about this article..."
                            className="comment-textarea"
                          />
                        </Form.Group>
                        <Button
                          disabled={loadingBlogReview}
                          type="submit"
                          variant="primary"
                          className="submit-comment-btn"
                        >
                          {loadingBlogReview ? "Submitting..." : "Submit Comment"}
                        </Button>
                      </Form>
                    ) : (
                      <Message className="login-prompt">
                        Please <Link to="/login">sign in</Link> to write a comment
                      </Message>
                    )}
                  </Card.Body>
                </Card>
              </Card.Body>
            </Card>
          </>
        )}
      </Container>
    </>
  );
};

export default BlogScreen;
