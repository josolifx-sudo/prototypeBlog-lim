const express = require("express");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const { requireAuth } = require("../middlewares/auth");

const router = express.Router();

function isOwnerOrAdmin(resourceAuthorId, user) {
  const isOwner = String(resourceAuthorId) === String(user._id);
  return isOwner || !!user.isAdmin;
}

function safePost(p, currentUserId) {
  const likedByMe = currentUserId
    ? (p.likes || []).some((id) => String(id) === String(currentUserId))
    : false;

  return {
    _id: p._id,
    title: p.title,
    content: p.content,
    imageUrl: p.imageUrl || "",
    author: p.author,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    likeCount: (p.likes || []).length,
    likedByMe
  };
}

/*
GET /api/posts?page=1&limit=10
Public feed with pagination
*/
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit || "8", 10)));
    const skip = (page - 1) * limit;

    const total = await Post.countDocuments();

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username avatarUrl");

    return res.json({
      page,
      limit,
      total,
      hasMore: skip + posts.length < total,
      posts: posts.map((p) => safePost(p, null))
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error fetching posts" });
  }
});

/*
GET /api/posts/trending
Top liked and most commented
*/
router.get("/trending", async (req, res) => {
  try {
    const topLiked = await Post.find()
      .sort({ likes: -1, createdAt: -1 })
      .limit(5)
      .populate("author", "username avatarUrl");

    const mostCommentedAgg = await Comment.aggregate([
      { $group: { _id: "$post", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const postIds = mostCommentedAgg.map((x) => x._id);
    const mostCommentedPosts = await Post.find({ _id: { $in: postIds } })
      .populate("author", "username avatarUrl");

    const countMap = {};
    mostCommentedAgg.forEach((x) => (countMap[String(x._id)] = x.count));

    const mostCommented = mostCommentedPosts
      .map((p) => ({
        post: safePost(p, null),
        commentCount: countMap[String(p._id)] || 0
      }))
      .sort((a, b) => b.commentCount - a.commentCount);

    return res.json({
      topLiked: topLiked.map((p) => safePost(p, null)),
      mostCommented
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error fetching trending" });
  }
});

/*
GET /api/posts/:id
Single post plus comments
*/
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "username avatarUrl");
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comments = await Comment.find({ post: post._id })
      .sort({ createdAt: -1 })
      .populate("author", "username avatarUrl");

    return res.json({
      post: safePost(post, null),
      comments
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error fetching post" });
  }
});

/*
POST /api/posts
Create post (auth required)
*/
router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "title and content are required" });
    }

    const created = await Post.create({
      title,
      content,
      imageUrl: imageUrl || "",
      author: req.user._id,
      likes: []
    });

    const populated = await Post.findById(created._id).populate("author", "username avatarUrl");

    return res.status(201).json({ message: "Post created", post: safePost(populated, req.user._id) });
  } catch (err) {
    return res.status(500).json({ error: "Server error creating post" });
  }
});

/*
PUT /api/posts/:id
Update post (owner or admin)
*/
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (!isOwnerOrAdmin(post.author, req.user)) {
      return res.status(403).json({ error: "Not allowed" });
    }

    if (title) post.title = title;
    if (content) post.content = content;
    post.imageUrl = imageUrl !== undefined ? imageUrl : post.imageUrl;

    await post.save();

    const populated = await Post.findById(post._id).populate("author", "username avatarUrl");

    return res.json({ message: "Post updated", post: safePost(populated, req.user._id) });
  } catch (err) {
    return res.status(500).json({ error: "Server error updating post" });
  }
});

/*
DELETE /api/posts/:id
Delete post (owner or admin)
Also deletes comments under it
*/
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (!isOwnerOrAdmin(post.author, req.user)) {
      return res.status(403).json({ error: "Not allowed" });
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    return res.json({ message: "Post deleted" });
  } catch (err) {
    return res.status(500).json({ error: "Server error deleting post" });
  }
});

/*
POST /api/posts/:id/like
Toggle like (auth required)
*/
router.post("/:id/like", requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "username avatarUrl");
    if (!post) return res.status(404).json({ error: "Post not found" });

    const me = String(req.user._id);
    const likes = post.likes || [];
    const hasLiked = likes.some((id) => String(id) === me);

    if (hasLiked) {
      post.likes = likes.filter((id) => String(id) !== me);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    const updated = await Post.findById(post._id).populate("author", "username avatarUrl");

    return res.json({
      message: hasLiked ? "Unliked" : "Liked",
      post: safePost(updated, req.user._id)
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error toggling like" });
  }
});

module.exports = router;