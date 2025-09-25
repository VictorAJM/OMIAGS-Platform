import express from "express";
import Course from "../../models/Course.js";

const router = express.Router();

// GET /api/courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    const formatted = courses.map(c => ({
      id: c._id.toString(),
      title: c.title,
      description: c.description,
      progress: c.progress
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/courses
router.post("/", async (req, res) => {
  try {
    const { title, description, accessList } = req.body;

    const newCourse = new Course({
      title,
      description,
      accessList: accessList || []
    });

    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
