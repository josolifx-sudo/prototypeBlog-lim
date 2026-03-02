const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { requireAuth } = require("../middlewares/auth");

const router = express.Router();

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function safeUser(u) {
  return {
    id: u._id,
    email: u.email,
    username: u.username,
    isAdmin: u.isAdmin,
    avatarUrl: u.avatarUrl || "",
    photos: u.photos || []
  };
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

    const user = await User.create({
      email,
      username,
      passwordHash,
      isAdmin: false,
      photos: [],
      avatarUrl: ""
    });

    return res.status(201).json({
      message: "Registered successfully",
      user: safeUser(user)
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
      user: safeUser(user)
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error on login" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  return res.json({ user: req.user });
});

router.put("/photos", requireAuth, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "url is required" });
    if (!isHttpUrl(url)) return res.status(400).json({ error: "url must be http or https" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const photos = user.photos || [];
    if (photos.length >= 5) return res.status(400).json({ error: "Maximum of 5 photos only" });

    if (photos.includes(url)) return res.status(409).json({ error: "Photo already exists" });

    user.photos.push(url);

    if (!user.avatarUrl) user.avatarUrl = url;

    await user.save();
    return res.json({ message: "Photo added", user: safeUser(user) });
  } catch (err) {
    return res.status(500).json({ error: "Server error adding photo" });
  }
});

router.delete("/photos", requireAuth, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "url is required" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.photos = (user.photos || []).filter((p) => p !== url);

    if (user.avatarUrl === url) {
      user.avatarUrl = user.photos[0] || "";
    }

    await user.save();
    return res.json({ message: "Photo removed", user: safeUser(user) });
  } catch (err) {
    return res.status(500).json({ error: "Server error removing photo" });
  }
});

router.put("/avatar", requireAuth, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "url is required" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!(user.photos || []).includes(url)) {
      return res.status(400).json({ error: "Avatar must be one of your saved photos" });
    }

    user.avatarUrl = url;
    await user.save();

    return res.json({ message: "Avatar updated", user: safeUser(user) });
  } catch (err) {
    return res.status(500).json({ error: "Server error updating avatar" });
  }
});

module.exports = router;