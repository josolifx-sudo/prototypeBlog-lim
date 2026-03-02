const jwt = require("jsonwebtoken");
const User = require("../models/User");

function getTokenFromHeader(req) {
  const auth = req.headers.authorization || "";
  const parts = auth.split(" ");
  if (parts.length === 2 && parts[0] === "Bearer") return parts[1];
  return null;
}

async function requireAuth(req, res, next) {
  try {
    const token = getTokenFromHeader(req);
    if (!token) return res.status(401).json({ error: "Missing token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.id).select("_id username email isAdmin");
    if (!user) return res.status(401).json({ error: "Invalid token user" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) return res.status(403).json({ error: "Admin only" });
  next();
}

module.exports = { requireAuth, requireAdmin };