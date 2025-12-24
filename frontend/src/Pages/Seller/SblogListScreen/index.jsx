import { LinkContainer } from "react-router-bootstrap";
import { Table, Button, Row, Col, Container } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useParams } from "react-router-dom";

import Message from "../../../components/Message";
import Loader from "../../../components/Loader";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  useGetBlogQuery,
  useCreateBlogsMutation,
  useDeleteBlogMutation,
} from "../../../slices/blogsApiSlice";
import { getErrorMessage } from "../../../utils/errorUtils";

const SblogListScreen = () => {
  const { pageNumber } = useParams();

  const { userInfo } = useSelector((state) => state.auth);

  const { data, isLoading, error, refetch } = useGetBlogQuery({
    pageNumber,
  });

  // Filter blogs to show only blogs created by the logged-in seller
  const sellerBlogs = data?.blogs?.filter(
    (blog) => blog.user._id === userInfo._id
  );

  const [createBlogs, { isLoading: loadingCreate }] = useCreateBlogsMutation();

  const [deleteBlog, { isLoading: loadingDelete }] = useDeleteBlogMutation();

  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure")) {
      try {
        await deleteBlog(id);
        refetch();
        toast.success("Blog deleted successfully");
      } catch (err) {
        console.error("Delete error:", err);
        toast.error(getErrorMessage(err));
      }
    }
  };

  const createBlogHandler = async () => {
    if (window.confirm("Are you sure you want to create a new Blog?")) {
      try {
        await createBlogs();
        refetch();
        toast.success("Blog created successfully");
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    }
  };

  return (
    <>
      <Container>
        <Row className="align-items-center">
          <Col>
            <h1>Blogs</h1>
          </Col>
          <Col className="text-end">
            <Button className="btn-sm m-3" onClick={createBlogHandler}>
              <FaEdit /> Create Blog
            </Button>
          </Col>
        </Row>
        {loadingCreate && <Loader />}
        {loadingDelete && <Loader />}

        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{getErrorMessage(error)}</Message>
        ) : (
          <>
            <Table striped hover responsive className="table-sm">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>NAME</th>
                  <th>CATEGORY</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sellerBlogs && sellerBlogs.length > 0 ? (
                  sellerBlogs.map((blog) => (
                    <tr key={blog._id}>
                      <td>{blog._id}</td>
                      <td>{blog.name}</td>
                      <td>{Array.isArray(blog.category) ? blog.category.join(", ") : blog.category}</td>
                      <td>
                        <LinkContainer to={`/seller/blog/${blog._id}/edit`}>
                          <Button variant="light" className="btn-sm mx-2">
                            <FaEdit />
                          </Button>
                        </LinkContainer>
                        <Button
                          variant="danger"
                          className="btn-sm"
                          onClick={() => deleteHandler(blog._id)}
                        >
                          <FaTrash style={{ color: "white" }} />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">
                      <Message>No blogs found. Create your first blog!</Message>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </>
        )}
      </Container>
    </>
  );
};

export default SblogListScreen;

