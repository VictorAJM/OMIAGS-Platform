import express from "express";
import Lesson from "../../models/Lesson.js";

const router = express.Router();

// GET /api/lessons/:courseId
router.get("/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;

    // Find lessons for this course
    const lessons = await Lesson.find({ courseId });

    res.json(lessons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;