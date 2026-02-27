const router = require("express").Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  updateMyProfile,
  adminListUsers,
  adminUpdateUser,
  adminDeleteUser
} = require("../controllers/userController");

router.put("/me", protect, updateMyProfile);

router.get("/", protect, adminOnly, adminListUsers);
router.put("/:id", protect, adminOnly, adminUpdateUser);
router.delete("/:id", protect, adminOnly, adminDeleteUser);

module.exports = router;