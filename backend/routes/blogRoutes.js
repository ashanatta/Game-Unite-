import express from "express";
const router = express.Router();

import {
  getBlog,
  getBlogById,
  createBlogs,
  updateBlog,
  deleteBlog,
  createBlogReview,
} from "../controllers/blogController.js";
import { protect, admin, adminSeller } from "../middleware/authMiddleware.js";

router.route("/").get(getBlog).post(protect, adminSeller, createBlogs);
router
  .route("/:id")
  .get(getBlogById)
  .put(protect, adminSeller, updateBlog)
  .delete(protect, adminSeller, deleteBlog);

router.route("/:id/reviews").post(protect, createBlogReview);

export default router;
