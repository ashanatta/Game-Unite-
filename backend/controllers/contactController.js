import asyncHandle from "express-async-handler";
import nodemailer from "nodemailer";

//@desc Send contact form email
//@route POST /api/contact
//@access public
const sendContactEmail = asyncHandle(async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validate required fields
  if (!name || !email || !subject || !message) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error("Please enter a valid email address");
  }

  // Validate email configuration
  if (!process.env.USER || !process.env.PASS) {
    console.error("❌ Email configuration missing. Required: USER, PASS");
    console.error("Current env vars:", {
      HOST: process.env.HOST ? "✓ Set" : "✗ Missing",
      SERVICE: process.env.SERVICE ? "✓ Set" : "✗ Missing",
      USER: process.env.USER ? "✓ Set" : "✗ Missing",
      PASS: process.env.PASS ? "✓ Set" : "✗ Missing",
      EMAIL_PORT: process.env.EMAIL_PORT || "Not set",
      SECURE: process.env.SECURE || "Not set",
    });
    res.status(500);
    throw new Error("Email service is not configured. Please contact the administrator.");
  }

  try {
    // Create transporter configuration
    const transporterConfig = {
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    };

    // Add service if provided (takes precedence over host/port)
    if (process.env.SERVICE) {
      transporterConfig.service = process.env.SERVICE;
      console.log(`📧 Using email service: ${process.env.SERVICE}`);
    } else if (process.env.HOST) {
      transporterConfig.host = process.env.HOST;
      if (process.env.EMAIL_PORT) {
        transporterConfig.port = Number(process.env.EMAIL_PORT);
      }
      if (process.env.SECURE !== undefined) {
        transporterConfig.secure = process.env.SECURE === 'true' || process.env.SECURE === true;
      }
      console.log(`📧 Using SMTP host: ${process.env.HOST}:${transporterConfig.port || 587}`);
    } else {
      // Default to Gmail if nothing specified
      transporterConfig.service = 'gmail';
      console.log("📧 Using default Gmail service");
    }

    const transporter = nodemailer.createTransport(transporterConfig);

    // Verify transporter configuration
    console.log("🔄 Verifying email configuration...");
    await transporter.verify();
    console.log("✅ Email server is ready to send messages");

    // Email to site owner/admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.USER;
    
    const mailOptions = {
      from: process.env.USER,
      to: adminEmail,
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
      replyTo: email,
    };

    await transporter.sendMail(mailOptions);

    // Optional: Send confirmation email to user
    if (process.env.SEND_CONFIRMATION_EMAIL === 'true') {
      const confirmationMail = {
        from: process.env.USER,
        to: email,
        subject: `Thank you for contacting us - ${subject}`,
        html: `
          <h2>Thank you for contacting us!</h2>
          <p>Dear ${name},</p>
          <p>We have received your message and will get back to you within a matter of hours.</p>
          <p><strong>Your message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <p>Best regards,<br>GameUnite Team</p>
        `,
      };
      await transporter.sendMail(confirmationMail);
    }

    res.status(200).json({
      success: true,
      message: "Email sent successfully! We'll get back to you soon.",
    });
  } catch (error) {
    console.error("❌ Email error details:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });
    
    // Provide more specific error messages
    let errorMessage = "Failed to send email. Please try again later.";
    
    if (error.code === 'EAUTH') {
      errorMessage = "Email authentication failed. Please check your email credentials.";
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      errorMessage = "Could not connect to email server. Please check your internet connection.";
    } else if (error.message) {
      errorMessage = `Email error: ${error.message}`;
    }
    
    res.status(500);
    throw new Error(errorMessage);
  }
});

export { sendContactEmail };

