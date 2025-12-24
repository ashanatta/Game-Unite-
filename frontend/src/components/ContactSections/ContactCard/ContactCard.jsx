import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { CiLocationOn } from "react-icons/ci";
import { IoCallOutline } from "react-icons/io5";
import { CiMail } from "react-icons/ci";
import axios from "axios";
import { toast } from "react-toastify";

function ContactCard() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post("/api/contact", formData);
      toast.success(response.data.message || "Email sent successfully! We'll get back to you soon.");
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to send email. Please try again later.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Container className="mt-5 mb-5">
        <h3 className="text-center text-black fw-bold fs-2">
          VISIT OUR OFFICE
        </h3>
        <Row className="justify-content-center mt-5">
          <Col md={4} sm={6} xs={12} className="mb-3">
            <div className="card text-center text-black">
              <div className="card-body">
                <IoCallOutline className="icon display-2 m-2" />
                <h5 className="card-title fw-bold">Phone </h5>
                <p className="card-text">professional</p>
                <Button variant="outline-primary" block>
                  Submit Request
                </Button>
              </div>
            </div>
          </Col>
          <Col md={4} sm={6} xs={12} className="mb-3">
            <div className="card text-center">
              <div className="card-body Bg">
                <CiLocationOn className="icon text-light display-2 m-2" />
                <h5 className="card-title fw-bold text-light">Location</h5>
                <p className="card-text text-light">professional</p>
                <Button variant="outline-light" block>
                  Submit Request
                </Button>
              </div>
            </div>
          </Col>
          <Col md={4} sm={6} xs={12} className="mb-3">
            <div className="card text-center text-black">
              <div className="card-body">
                <CiMail className="icon  display-2 m-2" />
                <h5 className="card-title fw-bold ">Email</h5>
                <p className="card-text">professional</p>
                <Button variant="outline-primary" block>
                  Submit Request
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        <section className="mb-2 bg-light">
          <h3 className="text-center  pb-4 mt-4 pt-4 fw-bold fs-1 text-black">
            Let’s Talk
          </h3>
          <p className=" p text-center w-responsive mx-auto mb-5 text-black">
            Do you have any questions? Please do not hesitate to contact us
            directly. Our team will come back to you within a matter of hours to
            help you.
          </p>

          <Row className="justify-content-center">
            <Col md={6}>
              <Form
                id="contact-form"
                name="contact-form"
                onSubmit={handleSubmit}
                className="mx-auto"
              >
                <Row className="mb-2">
                  <Col md={6}>
                    <Form.Group controlId="name">
                      <Form.Control 
                        type="text" 
                        placeholder="Your name" 
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="email">
                      <Form.Control 
                        type="email" 
                        placeholder="Your email" 
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group controlId="subject" className=" mb-2">
                  <Form.Control 
                    type="text" 
                    placeholder="Subject" 
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="message">
                  <Form.Control
                    as="textarea"
                    rows="5"
                    placeholder="Your message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <div className="text-center text-md-left mt-3 mb-4 ">
                  <Button 
                    type="submit" 
                    block 
                    className=" w-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send"}
                  </Button>
                </div>
              </Form>
            </Col>
          </Row>
        </section>
      </Container>
    </>
  );
}

export default ContactCard;
