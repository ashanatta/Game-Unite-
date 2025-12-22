import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = filetypes.test(file.originalname.toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Images only! Allowed formats: jpg, jpeg, png, webp"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const uploadSingleImage = upload.single("image");

router.post("/", async (req, res) => {
  uploadSingleImage(req, res, async function (err) {
    if (err) {
      return res.status(400).send({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).send({ message: "No file uploaded" });
    }

    try {
      // Upload buffer directly to Cloudinary
      const uploadOptions = {
        folder: "products", // Organize images in a folder
        resource_type: "image",
      };

      // Convert buffer to base64 data URI for Cloudinary
      const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataUri, uploadOptions);

      // Return the Cloudinary URL
      res.status(200).send({
        message: "Image uploaded successfully",
        image: result.secure_url, // Cloudinary secure URL
      });
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      res.status(500).send({
        message: "Failed to upload image to Cloudinary",
        error: error.message,
      });
    }
  });
});

export default router;
