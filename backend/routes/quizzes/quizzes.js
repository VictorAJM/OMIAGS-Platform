import express from "express";
import Quiz from "../../models/Quiz.js";

const router = express.Router();

// GET /api/quizzes?courseId=...
// Gets all quizzes for a specific course
router.get("/", async (req, res) => {
  try {
    const { courseId } = req.query;
    if (!courseId) {
      return res.status(400).json({ message: "A courseId query parameter is required." });
    }

    // Find all quizzes that have the matching courseId
    const quizzes = await Quiz.find({ courseId }).select("title description");

    res.json(quizzes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching quizzes." });
  }
});

// GET /api/quizzes/:quizId
router.get("/:quizId", async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json({
      id: quiz._id.toString(),
      title: quiz.title,
      //questions: quiz.questions,
      // Map over questions to remove the correct answer before sending to the client
      questions: quiz.questions.map(q => ({
        _id: q._id,
        title: q.title,
        type: q.type,
        value: q.value,
        options: q.options,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

// POST /api/quizzes
router.post("/", async (req, res) => {
  try {
    const { title, description, courseId, questions } = req.body;

    // Basic validation to ensure required fields are present
    if (!title || !courseId || !questions) {
      return res.status(400).json({ message: "Missing required fields: title, courseId, and questions are required." });
    }

    const newQuiz = new Quiz({
      title,
      description,
      courseId,
      questions,
    });

    await newQuiz.save();
    res.status(201).json(newQuiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while creating quiz." });
  }
});

export default router;
