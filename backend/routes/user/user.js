import express from "express";
import User from "../../models/User.js";

const router = express.Router();

// PUT /api/users/:userId/role
// Update user role (student or admin)
router.put("/:userId/role", async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate required fields
    if (!role) {
      return res.status(400).json({ message: "Role is required." });
    }

    // Validate role value
    if (!["student", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Must be either 'student' or 'admin'.",
      });
    }

    // Find user and update role
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true },
    ).select("name email role"); // Only return these fields for security

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({
      message: "User role updated successfully.",
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);

    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    return res.status(500).json({
      message: "Server error while updating user role.",
    });
  }
});

// GET /api/users/:userId
// Get specific user details
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select(
      "name email role createdAt",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json(user);
  } catch (err) {
    console.error(err);

    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    return res.status(500).json({ message: "Server error." });
  }
});

// GET /api/users
// Get all users (useful for admin to see all users and their roles)
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("name email role createdAt");
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error while fetching users.",
    });
  }
});

export default router;
