const User = require("../models/User");

async function updateMyProfile(req, res, next) {
  try {
    const { username } = req.body;

    if (!username) {
      res.status(400);
      throw new Error("Username is required");
    }

    const user = await User.findById(req.user._id);
    user.username = username;
    await user.save();

    const safeUser = await User.findById(req.user._id).select("-passwordHash");

    return res.status(200).json({ success: true, user: safeUser });
  } catch (err) {
    next(err);
  }
}

async function adminListUsers(req, res, next) {
  try {
    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, users });
  } catch (err) {
    next(err);
  }
}

async function adminUpdateUser(req, res, next) {
  try {
    const { username, isAdmin } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (typeof username === "string" && username.trim().length > 0) {
      user.username = username.trim();
    }

    if (typeof isAdmin === "boolean") {
      user.isAdmin = isAdmin;
    }

    await user.save();
    const safeUser = await User.findById(user._id).select("-passwordHash");

    return res.status(200).json({ success: true, user: safeUser });
  } catch (err) {
    next(err);
  }
}

async function adminDeleteUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    await user.deleteOne();
    return res.status(200).json({ success: true, message: "User deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { updateMyProfile, adminListUsers, adminUpdateUser, adminDeleteUser };