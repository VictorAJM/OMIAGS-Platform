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

// POST /api/lessons
router.post("/", async (req, res) => {
  try {
    const { courseId, title, description, content } = req.body;
    if (!courseId || !title) return res.status(400).json({ message: "courseId and title required" });

    const lesson = new Lesson({ courseId, title, description, content });
    await lesson.save();
    res.status(201).json(lesson);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/lessons/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await Lesson.findByIdAndDelete(id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json({ message: "Lesson deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
