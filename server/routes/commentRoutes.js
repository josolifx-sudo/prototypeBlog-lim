const express = require("express");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const { requireAuth } = require("../middlewares/auth");

const router = express.Router();

// Create comment (auth)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { postId, text } = req.body;
    if (!postId || !text) return res.status(400).json({ error: "postId and text are required" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = await Comment.create({
      post: post._id,
      author: req.user._id,
      text
    });

    const populated = await Comment.findById(comment._id).populate("author", "username isAdmin");

    return res.status(201).json({ message: "Comment added", comment: populated });
  } catch (err) {
    return res.status(500).json({ error: "Server error adding comment" });
  }
});

// Update comment (owner or admin)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text is required" });

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const isOwner = String(comment.author) === String(req.user._id);
    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({ error: "Not allowed" });
    }

    comment.text = text;
    await comment.save();

    const populated = await Comment.findById(comment._id).populate("author", "username isAdmin");

    return res.json({ message: "Comment updated", comment: populated });
  } catch (err) {
    return res.status(500).json({ error: "Server error updating comment" });
  }
});

// Delete comment (owner or admin)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const isOwner = String(comment.author) === String(req.user._id);

    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({ error: "Not allowed" });
    }

    await comment.deleteOne();
    return res.json({ message: "Comment deleted" });
  } catch (err) {
    return res.status(500).json({ error: "Server error deleting comment" });
  }
});

module.exports = router;