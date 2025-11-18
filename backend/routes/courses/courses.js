import express from "express";
import Course from "../../models/Course.js";
import Lesson from "../../models/Lesson.js";
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

    // obtener conteo de lecciones por curso
    const lessonsByCourse = await Lesson.aggregate([
      { $match: { courseId: { $in: courses.map((c) => c._id) } } },
      { $group: { _id: "$courseId", count: { $sum: 1 } } },
    ]);

    /** @type {{ [key: string]: number }} */
    const lessonCountMap = {};
    lessonsByCourse.forEach((l) => {
      lessonCountMap[l._id.toString()] = l.count;
    });

    const formatted = courses.map((c) => ({
      id: c._id.toString(),
      name: c.title,
      description: c.description,
      category: c.category,
      lessons: lessonCountMap[c._id.toString()] || 0,
      students: 0, // si luego quieres agregar alumnos
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

router.get("/:courseId/lessons", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.owner?.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const lessons = await Lesson.find({ courseId });

    const formatted = lessons.map((l) => ({
      id: l._id.toString(),
      title: l.title,
      description: l.description,
      completed: l.completed,
      contents: l.contents,
    }));

    res.json(formatted);
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

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { title, description, category } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Not found" });

    if (course.owner.toString() !== userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    course.title = title || course.title;
    course.description = description || course.description;
    course.category = category || course.category;

    await course.save();

    res.json({
      id: course._id,
      title: course.title,
      description: course.description,
      category: course.category,
      progress: course.progress,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
