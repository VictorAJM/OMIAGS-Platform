import express from "express";
import Lesson from "../../models/Lesson.js";
import Enrollment from "../../models/Enrollments.js";

const router = express.Router();

const validateContent = (contents) => {
  if (!Array.isArray(contents)) return "Contents must be an array";

  for (let item of contents) {
    if (!item.title) return "All contents must have a title";
    if (!["video", "pdf", "text", "quiz"].includes(item.type)) {
      return `Invalid content type: ${item.type}`;
    }
    if ((item.type === "video" || item.type === "pdf") && !item.url) {
      return `Content "${item.title}" requires a URL`;
    }
    if (item.type === "text" && !item.textContent) {
      return `Content "${item.title}" requires textContent`;
    }
    if (item.type === "quiz" && !item.quizId) {
      return `Content "${item.title}" requires a quizId`;
    }
  }
  return null;
};

router.get("/:id", async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("courseId");
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:courseId/lessons", async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await Lesson.find({ courseId }).sort({ createdAt: 1 });
    res.json(lessons);
  } catch (err) {
    console.error("Error fetching lessons:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { courseId, title, description, contents } = req.body;

    if (!courseId || !title)
      return res.status(400).json({ message: "courseId and title required" });

    if (contents && contents.length > 0) {
      const error = validateContent(contents);
      if (error) return res.status(400).json({ message: error });
    }

    const lesson = new Lesson({ courseId, title, description, contents });
    await lesson.save();
    res.status(201).json(lesson);
  } catch (err) {
    console.error("Error creating lesson:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, contents } = req.body;

    const lesson = await Lesson.findById(id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    if (title !== undefined) lesson.title = title;
    if (description !== undefined) lesson.description = description;

    if (contents !== undefined) {
      const error = validateContent(contents);
      if (error) return res.status(400).json({ message: error });
      lesson.contents = contents;
    }

    await lesson.save();
    res.json({ message: "Lesson updated", lesson });
  } catch (err) {
    console.error("Error updating lesson:", err);
    res.status(500).json({ message: "Server error" });
  }
});

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

router.put("/:id/toggle-completion", async (req, res) => {
  try {
    const { userId, completed } = req.body;

    if (!userId) return res.status(400).json({ message: "User ID required" });
    if (typeof completed !== "boolean") {
      return res.status(400).json({ message: "Completed must be boolean" });
    }

    const lessonId = req.params.id;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const enrollment = await Enrollment.findOne({
      student: userId,
      course: lesson.courseId,
    });

    if (!enrollment) {
      return res
        .status(404)
        .json({ message: "Student is not enrolled in this course" });
    }

    if (completed) {
      if (!enrollment.completedLessons.includes(lessonId)) {
        enrollment.completedLessons.push(lessonId);
      }
    } else {
      enrollment.completedLessons = enrollment.completedLessons.filter(
        (id) => id.toString() !== lessonId,
      );
    }

    await enrollment.save();

    res.json({
      message: completed
        ? "Lesson marked as complete"
        : "Lesson marked as incomplete",
      studentProgress: enrollment.studentProgress,
      completedLessons: enrollment.completedLessons,
    });
  } catch (err) {
    console.error("Error toggling completion:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/content/:contentId", async (req, res) => {
  try {
    const { contentId } = req.params;
    const lesson = await Lesson.findOne(
      { "contents._id": contentId },
      { "contents.$": 1, title: 1, courseId: 1 },
    );

    if (!lesson || !lesson.contents || lesson.contents.length === 0) {
      return res.status(404).json({ message: "Contenido no encontrado" });
    }

    const contentData = lesson.contents[0];
    res.json({
      ...contentData.toObject(),
      lessonTitle: lesson.title,
      lessonId: lesson._id,
      courseId: lesson.courseId,
    });
  } catch (err) {
    console.error("Error fetching content:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
