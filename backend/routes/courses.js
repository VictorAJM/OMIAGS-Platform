import express from "express";
import Course from "../models/Course.js";

const router = express.Router();

// GET /api/courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find(); 
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
