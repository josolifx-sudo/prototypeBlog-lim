const Post = require("../models/Post");
const Comment = require("../models/Comment");

async function getAllPosts(req, res, next) {
  try {
    const posts = await Post.find()
      .populate("author", "username email isAdmin")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, posts });
  } catch (err) {
    next(err);
  }
}

async function getSinglePost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id).populate("author", "username email isAdmin");
    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    const comments = await Comment.find({ post: post._id })
      .populate("author", "username email isAdmin")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, post, comments });
  } catch (err) {
    next(err);
  }
}

async function createPost(req, res, next) {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      res.status(400);
      throw new Error("Title and content are required");
    }

    const post = await Post.create({
      title,
      content,
      author: req.user._id
    });

    const populated = await Post.findById(post._id).populate("author", "username email isAdmin");

    return res.status(201).json({ success: true, post: populated });
  } catch (err) {
    next(err);
  }
}

async function updatePost(req, res, next) {
  try {
    const { title, content } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    const isOwner = post.author.toString() === req.user._id.toString();
    if (!isOwner && !req.user.isAdmin) {
      res.status(403);
      throw new Error("Not allowed to edit this post");
    }

    post.title = title ?? post.title;
    post.content = content ?? post.content;

    await post.save();

    const populated = await Post.findById(post._id).populate("author", "username email isAdmin");

    return res.status(200).json({ success: true, post: populated });
  } catch (err) {
    next(err);
  }
}

async function deletePost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    const isOwner = post.author.toString() === req.user._id.toString();
    if (!isOwner && !req.user.isAdmin) {
      res.status(403);
      throw new Error("Not allowed to delete this post");
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    return res.status(200).json({ success: true, message: "Post deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllPosts, getSinglePost, createPost, updatePost, deletePost };