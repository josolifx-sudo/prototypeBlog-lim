const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { requireAuth } = require("../middlewares/auth");

const router = express.Router();

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: "email, username, password are required" });
    }
    if (!isEmail(email)) return res.status(400).json({ error: "Invalid email format" });
    if (username.length < 3) return res.status(400).json({ error: "Username must be at least 3 characters" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(409).json({ error: "Email or username already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({ email, username, passwordHash, isAdmin: false });

    return res.status(201).json({
      message: "Registered successfully",
      user: { id: user._id, email: user.email, username: user.username, isAdmin: user.isAdmin }
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error on register" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) return res.status(400).json({ error: "login and password are required" });

    const user = await User.findOne({ $or: [{ email: login }, { username: login }] });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email, username: user.username, isAdmin: user.isAdmin }
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error on login" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;