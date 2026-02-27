const router = require("express").Router();
const {
  getAllPosts,
  getSinglePost,
  createPost,
  updatePost,
  deletePost
} = require("../controllers/postController");
const { protect } = require("../middlewares/authMiddleware");
const { addComment } = require("../controllers/commentController");

router.get("/", getAllPosts);
router.get("/:id", getSinglePost);

router.post("/", protect, createPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

router.post("/:postId/comments", protect, addComment);

module.exports = router;