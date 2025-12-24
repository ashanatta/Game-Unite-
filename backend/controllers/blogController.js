import asyncHandler from "express-async-handler";

import Blog from "../models/blogModel.js";

//@desc Fetch all Genres
//@route GET /api/products
//@access public
const getBlog = asyncHandler(async (req, res) => {
  const pageSize = 20;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? { name: { $regex: req.query.keyword, $options: "i" } }
    : {};

  const count = await Blog.countDocuments({ ...keyword });
  const blogs = await Blog.find({ ...keyword })
    .populate("user", "name email _id")
    .limit(pageSize)
    .skip(pageSize * (page - 1));
  res.json({ blogs, page, pages: Math.ceil(count / pageSize) });
});

//@desc Fetch a Genre
//@route GET /api/products/:id
//@access public
const getBlogById = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("user", "name email _id");
  if (blog) {
    return res.json(blog);
  } else {
    res.status(404);
    throw new Error("Blog not found");
  }
});

//@desc Create a Genres
//@route POST /api/products
//@access Private/Admin/Seller
const createBlogs = asyncHandler(async (req, res) => {
  const blog = new Blog({
    name: "Sample name",
    user: req.user._id,
    image: "/images/attacks.jpg",
    category: ["Other"], // Fix: category should be an array
    description: "Sample description",
  });

  const createdBlog = await blog.save();

  res.status(201).json(createdBlog);
});

//@desc update a genre
//@route PUT /api/products/:id
//@access private/admin/seller
const updateBlog = asyncHandler(async (req, res) => {
  const { name, description, image, category } = req.body;

  const blog = await Blog.findById(req.params.id).populate("user", "_id");

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  // Check if user is admin or the blog owner
  if (!req.user.isAdmin && blog.user._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this blog");
  }

  // Update fields
  if (name !== undefined) blog.name = name;
  if (description !== undefined) blog.description = description;
  if (image !== undefined) blog.image = image;
  if (category !== undefined) {
    // Ensure category is an array
    blog.category = Array.isArray(category) ? category : [category];
  }

  const updatedBlog = await blog.save();
  res.status(200).json(updatedBlog);
});

//@desc delete a genre
//@route DELETE /api/products/:id
//@access private/admin/seller
const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("user", "_id");

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  // Check if user is admin or the blog owner
  if (!req.user.isAdmin && blog.user._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to delete this blog");
  }

  await blog.deleteOne({ _id: blog._id });
  res.status(200).json({ message: "Blog deleted successfully" });
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createBlogReview = asyncHandler(async (req, res) => {
  const { comment } = req.body;

  const blog = await Blog.findById(req.params.id);

  if (blog) {
    const alreadyReviewed = blog.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("Blog already reviewed");
    }

    const review = {
      name: req.user.name,
      comment,
      user: req.user._id,
    };

    blog.reviews.push(review);

    await blog.save();
    res.status(201).json({ message: "Review added" });
  } else {
    res.status(404);
    throw new Error("blog not found");
  }
});

export {
  getBlog,
  getBlogById,
  createBlogs,
  updateBlog,
  deleteBlog,
  createBlogReview,
};
