import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Form, Button, Container } from "react-bootstrap";
import Message from "../../../components/Message";
import Loader from "../../../components/Loader";
import FormContainer from "../../../components/FormContainer";
import { toast } from "react-toastify";
import {
  useGetBlogDetailsQuery,
  useUpdateBlogMutation,
  useUploadBlogImageMutation,
} from "../../../slices/blogsApiSlice";
import { getErrorMessage } from "../../../utils/errorUtils";
import JoditEditor from "jodit-react";
import { BASE_URL, UPLOAD_URL } from "../../../constants";

const SblogEditScreen = () => {
  const { id: blogId } = useParams();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const editor = useRef(null);
  const [content, setContent] = useState("");
  const {
    data: blog,
    isLoading,
    error,
    refetch,
  } = useGetBlogDetailsQuery(blogId);

  const [updateBlog, { isLoading: loadingUpdate }] = useUpdateBlogMutation();

  const [uploadBlogImage, { isLoading: loadingUpload }] =
    useUploadBlogImageMutation();

  const navigate = useNavigate();

  useEffect(() => {
    if (blog) {
      setName(blog.name);
      setContent(blog.description);
      setImage(blog.image);
      // Handle category as array or string
      setCategory(Array.isArray(blog.category) ? blog.category[0] : blog.category);
    }
  }, [blog]);

  // Function to convert base64 images to uploaded URLs
  const processBase64Images = async (htmlContent) => {
    if (!htmlContent) return htmlContent;

    // Find all base64 images in the content
    const base64Regex = /<img[^>]+src="data:image\/([^;]+);base64,([^"]+)"[^>]*>/g;
    const matches = [...htmlContent.matchAll(base64Regex)];
    
    if (matches.length === 0) return htmlContent;

    let processedContent = htmlContent;

    // Process each base64 image
    for (const match of matches) {
      try {
        const [fullMatch, imageType, base64Data] = match;
        
        // Convert base64 to blob
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: `image/${imageType}` });
        
        // Create FormData and upload
        const formData = new FormData();
        formData.append("image", blob, `image.${imageType}`);
        
        const res = await uploadBlogImage(formData).unwrap();
        
        // Replace base64 image with uploaded URL
        processedContent = processedContent.replace(
          fullMatch,
          `<img src="${res.image}" alt="Uploaded image" />`
        );
      } catch (err) {
        console.error("Error uploading base64 image:", err);
        toast.warning("Some images could not be uploaded. Please try uploading them manually.");
      }
    }

    return processedContent;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      // Process base64 images in content before submitting
      let processedContent = await processBase64Images(content);

      const updateBlogs = {
        blogId,
        name,
        description: processedContent,
        image,
        category: [category], // Convert to array as expected by backend
      };

      const result = await updateBlog(updateBlogs).unwrap();

      toast.success("Blog updated successfully");
      navigate("/seller/bloglist");
      refetch();
    } catch (error) {
      console.error("Error updating blog:", error);
      toast.error(getErrorMessage(error) || "An error occurred while updating the blog.");
    }
  };

  const uploadFileHandler = async (e) => {
    const formData = new FormData();
    formData.append("image", e.target.files[0]);
    try {
      const res = await uploadBlogImage(formData).unwrap();
      toast.success(res.message);
      setImage(res.image);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <>
      <Container>
        <Link to="/seller/bloglist" className="btn btn-light my-3">
          Go Back
        </Link>
        <FormContainer>
          <h1>Edit Blog</h1>
          {loadingUpdate && <Loader />}

          {isLoading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">{getErrorMessage(error)}</Message>
          ) : (
            <Form onSubmit={submitHandler}>
              <Form.Group controlId="name" className="my-2">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="image" className="my-2">
                <Form.Label>Image</Form.Label>
                <Form.Control
                  label="Choose File"
                  onChange={uploadFileHandler}
                  type="file"
                  accept="image/*"
                ></Form.Control>
                {image && (
                  <Form.Text className="text-muted">
                    Current image: {image}
                  </Form.Text>
                )}
                {loadingUpload && <Loader />}
              </Form.Group>

              <Form.Group controlId="category" className="my-2">
                <Form.Label>Category</Form.Label>
                <Form.Control
                  as="select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Action">Action</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Shooter">Shooter</option>
                  <option value="Family">Family</option>
                  <option value="Other">Other</option>
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="description" className="my-2">
                <Form.Label>Description</Form.Label>
                <JoditEditor
                  ref={editor}
                  value={content}
                  onChange={(newContent) => setContent(newContent)}
                  config={{
                    uploader: {
                      insertImageAsBase64URI: false, // Don't embed as base64
                      url: `${BASE_URL}${UPLOAD_URL}`,
                      format: "json",
                      filesVariableName: "image",
                      isSuccess: (resp) => {
                        return resp.image !== undefined;
                      },
                      getMessage: (resp) => {
                        return resp.message || "Image uploaded successfully";
                      },
                      process: (resp) => {
                        return {
                          files: [resp.image],
                          path: resp.image,
                          baseurl: "",
                          error: resp.error || 0,
                          msg: resp.message || "Image uploaded successfully",
                        };
                      },
                      error: (e) => {
                        toast.error("Image upload failed: " + e.message);
                      },
                      defaultHandlerSuccess: (jodit, resp) => {
                        if (resp.image) {
                          jodit.selection.insertImage(resp.image, null, 250);
                        }
                      },
                    },
                    image: {
                      upload: true,
                      edit: true,
                      remove: true,
                    },
                  }}
                />
              </Form.Group>

              <Button type="submit" variant="primary" className="my-2">
                Update
              </Button>
            </Form>
          )}
        </FormContainer>
      </Container>
    </>
  );
};

export default SblogEditScreen;

