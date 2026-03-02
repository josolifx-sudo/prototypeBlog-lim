const express = require("express");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const { requireAuth } = require("../middlewares/auth");

const router = express.Router();

// Public feed
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username isAdmin avatarUrl")
      .sort({ createdAt: -1 });

    return res.json({ posts });
  } catch (err) {
    return res.status(500).json({ error: "Server error fetching posts" });
  }
});

// Public single post with comments
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "username isAdmin avatarUrl");
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comments = await Comment.find({ post: post._id })
      .populate("author", "username isAdmin avatarUrl")
      .sort({ createdAt: 1 });

    return res.json({ post, comments });
  } catch (err) {
    return res.status(500).json({ error: "Server error fetching post" });
  }
});

// Create post (auth)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ error: "title and content are required" });

    const post = await Post.create({
      title,
      content,
      author: req.user._id
    });

    const populated = await Post.findById(post._id).populate("author", "username isAdmin avatarUrl");

    return res.status(201).json({ message: "Post created", post: populated });
  } catch (err) {
    return res.status(500).json({ error: "Server error creating post" });
  }
});

// Update post (owner or admin)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { title, content } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const isOwner = String(post.author) === String(req.user._id);
    if (!isOwner && !req.user.isAdmin) return res.status(403).json({ error: "Not allowed" });

    if (title) post.title = title;
    if (content) post.content = content;

    await post.save();

    const populated = await Post.findById(post._id).populate("author", "username isAdmin avatarUrl");

    return res.json({ message: "Post updated", post: populated });
  } catch (err) {
    return res.status(500).json({ error: "Server error updating post" });
  }
});

// Delete post (owner or admin)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const isOwner = String(post.author) === String(req.user._id);
    if (!isOwner && !req.user.isAdmin) return res.status(403).json({ error: "Not allowed" });

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    return res.json({ message: "Post deleted" });
  } catch (err) {
    return res.status(500).json({ error: "Server error deleting post" });
  }
});

module.exports = router;