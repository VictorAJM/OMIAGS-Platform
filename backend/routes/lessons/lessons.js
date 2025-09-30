import express from "express";
import Lesson from "../../models/Lesson.js";

const router = express.Router();

// en routes/lessons.js
router.get("/:id", async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("courseId");
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// en routes/courses.js
router.get("/:courseId/lessons", async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await Lesson.find({ courseId }).populate(
      "courseId",
      "title",
    );
    res.json(lessons);
  } catch (err) {
    console.error("Error fetching lessons:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/lessons
router.post("/", async (req, res) => {
  try {
    const { courseId, title, description, contents } = req.body;
    if (!courseId || !title)
      return res.status(400).json({ message: "courseId and title required" });

    const lesson = new Lesson({ courseId, title, description, contents });
    await lesson.save();
    res.status(201).json(lesson);
  } catch (err) {
    console.error("Error creating lesson:", err);
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
    console.error("Error deleting lesson:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/lessons/:id
// Body: { title?, description?, contents? }
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, contents } = req.body;

    // Find the lesson
    const lesson = await Lesson.findById(id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    // Update only allowed fields
    if (title !== undefined) lesson.title = title;
    if (description !== undefined) lesson.description = description;
    if (contents !== undefined) lesson.contents = contents;

    // Save changes
    await lesson.save();

    res.json({ message: "Lesson updated", lesson });
  } catch (err) {
    console.error("Error updating lesson:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/lessons/:id/completed
router.put("/:id/completed", async (req, res) => {
  try {
    const { completed } = req.body;

    if (typeof completed !== "boolean") {
      return res
        .status(400)
        .json({ message: "Completed must be true or false" });
    }

    const updatedLesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { completed },
      { new: true }, // return the updated document
    );

    if (!updatedLesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.json(updatedLesson);
  } catch (err) {
    console.error("Error updating lesson:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
