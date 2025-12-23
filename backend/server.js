import path from "path";
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import cors from "cors";
import Stripe from "stripe";
// import helmet from "helmet";

// Validate Stripe keys
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ Error: STRIPE_SECRET_KEY is not defined in environment variables");
  console.error("Please create a .env file in the backend directory with STRIPE_SECRET_KEY");
  process.exit(1);
}

if (!process.env.STRIPE_PUBLIC_KEY) {
  console.error("❌ Error: STRIPE_PUBLIC_KEY is not defined in environment variables");
  console.error("Please add STRIPE_PUBLIC_KEY to your .env file");
  console.error("Example: STRIPE_PUBLIC_KEY=pk_test_...");
  process.exit(1);
}

// Validate that keys are from the same account
const secretKeyPrefix = process.env.STRIPE_SECRET_KEY.substring(7, 20); // After "sk_test_"
const publicKeyPrefix = process.env.STRIPE_PUBLIC_KEY.substring(7, 20); // After "pk_test_"
if (secretKeyPrefix !== publicKeyPrefix) {
  console.warn("⚠️  Warning: Stripe key prefixes don't match!");
  console.warn(`   Secret key prefix: ${secretKeyPrefix}`);
  console.warn(`   Public key prefix: ${publicKeyPrefix}`);
  console.warn("   Make sure both keys are from the same Stripe account!");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
console.log("✅ Stripe initialized successfully");

const port = process.env.PORT || 5000;

connectDB();

const __dirname = path.resolve();
const uploadsPath = path.join(__dirname, "uploads");

const app = express();
// Allow both localhost and 127.0.0.1 for CORS
app.use(cors({ 
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadsPath));
app.use(cookieParser());

app.use("/api/products", productRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/messages", messageRoutes);

// Stripe public key endpoint - serves the public key from environment variable
app.get("/api/config/stripe", (req, res) => {
  if (!process.env.STRIPE_PUBLIC_KEY) {
    return res.status(500).json({ error: "Stripe public key not configured" });
  }
  res.json({ publishableKey: process.env.STRIPE_PUBLIC_KEY });
});

app.post("/api/create-checkout-session", async (req, res) => {
  console.log("📥 Received checkout session request");
  const { products, orderId } = req.body;

  if (!products || !Array.isArray(products)) {
    console.error("❌ Invalid request: Missing or invalid products data");
    return res.status(400).json({ error: "Invalid request: Missing or invalid products data" });
  }

  if (!orderId) {
    console.error("❌ Invalid request: Missing orderId");
    return res.status(400).json({ error: "Invalid request: Missing orderId" });
  }

  // Validate that all products have required fields
  for (const product of products) {
    if (!product.name || product.price === undefined || product.price === null || !product.qty) {
      console.error("Invalid product data:", JSON.stringify(product, null, 2));
      return res.status(400).json({ 
        error: "Invalid product data: Each product must have name, price, and qty",
        received: product
      });
    }
    
    // Validate price is a valid number
    if (isNaN(product.price) || product.price <= 0) {
      console.error("Invalid price:", product.price);
      return res.status(400).json({ 
        error: `Invalid price for product "${product.name}": ${product.price}. Price must be a positive number.`
      });
    }
  }

  try {
    console.log("✅ Creating line items for products:", products);
    const lineItems = products.map((product) => {
      const unitAmount = Math.round(product.price * 100);
      console.log(`  - ${product.name}: $${product.price} x ${product.qty} = ${unitAmount} cents`);
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
          },
          unit_amount: unitAmount,
        },
        quantity: product.qty,
      };
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    console.log(`🌐 Creating Stripe checkout session for order ${orderId}`);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${frontendUrl}/order/${orderId}?payment_status=paid&order_id=${orderId}`,
      cancel_url: `${frontendUrl}/order/${orderId}?payment_status=cancelled&order_id=${orderId}`,
    });

    console.log("✅ Checkout session created successfully:", session.id);
    res.json({ id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    const errorMessage = error.message || "Failed to create checkout session";
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));
