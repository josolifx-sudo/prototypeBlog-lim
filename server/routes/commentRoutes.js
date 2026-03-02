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

// Delete comment (admin only, or optional owner delete if needed in the future)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: "Admin only" });

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    await comment.deleteOne();
    return res.json({ message: "Comment deleted" });
  } catch (err) {
    return res.status(500).json({ error: "Server error deleting comment" });
  }
});

module.exports = router;