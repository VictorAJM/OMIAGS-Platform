import express from "express";
import Course from "../../models/Course.js";

const router = express.Router();

// GET /api/courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
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

// GET /api/courses/:courseId
router.get("/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({
      id: course._id.toString(),
      title: course.title,
      description: course.description,
      progress: course.progress,
      category: course.category,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/courses
router.post("/", async (req, res) => {
  try {
    const { title, description, accessList, category } = req.body;

    const newCourse = new Course({
      title,
      description,
      accessList: accessList || [],
      category,
    });

    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
