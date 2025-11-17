import express from "express";
import Course from "../../models/Course.js";
import { requireAuth } from "../../../middleware/auth.js";

const router = express.Router();

/* ===========================
   GET /api/courses
   Devuelve solo cursos del usuario
=========================== */
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const courses = await Course.find({ owner: userId });

    const formatted = courses.map((c) => ({
      id: c._id.toString(),
      title: c.title,
      description: c.description,
      progress: c.progress,
      category: c.category,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===========================
   GET /api/courses/:courseId
=========================== */
router.get("/:courseId", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.owner?.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({
      id: course._id.toString(),
      title: course.title,
      description: course.description,
      progress: course.progress,
      category: course.category,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===========================
   POST /api/courses
=========================== */
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, description, accessList, category } = req.body;

    const newCourse = new Course({
      title,
      description,
      category,
      accessList: accessList || [],
      owner: userId,
    });

    await newCourse.save();

    res.status(201).json({
      id: newCourse._id,
      title: newCourse.title,
      description: newCourse.description,
      category: newCourse.category,
      owner: newCourse.owner,
      progress: newCourse.progress,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===========================
   DELETE /api/courses/:id
=========================== */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const course = await Course.findById(req.params.id);

    if (!course) return res.status(404).json({ message: "Not found" });

    // permitir borrar cursos viejos sin owner
    if (!course.owner) {
      await course.deleteOne();
      return res.json({ message: "Deleted" });
    }

    if (course.owner.toString() !== userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await course.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
