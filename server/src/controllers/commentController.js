const Comment = require("../models/Comment");
const Post = require("../models/Post");

async function addComment(req, res, next) {
  try {
    const { content } = req.body;
    const postId = req.params.postId;

    if (!content) {
      res.status(400);
      throw new Error("Comment content is required");
    }

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      content
    });

    const populated = await Comment.findById(comment._id).populate("author", "username email isAdmin");

    return res.status(201).json({ success: true, comment: populated });
  } catch (err) {
    next(err);
  }
}

async function deleteComment(req, res, next) {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      res.status(404);
      throw new Error("Comment not found");
    }

    const isOwner = comment.author.toString() === req.user._id.toString();

    if (!isOwner && !req.user.isAdmin) {
      res.status(403);
      throw new Error("Not allowed to delete this comment");
    }

    await comment.deleteOne();

    return res.status(200).json({ success: true, message: "Comment deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { addComment, deleteComment };