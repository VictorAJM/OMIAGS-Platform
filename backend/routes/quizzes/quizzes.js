import express from "express";
import Quiz from "../../models/Quiz.js";
import { requireAuth } from "../../../middleware/auth.js";
import QuizAttempt from "../../models/QuizAttempt.js";

const router = express.Router();

// GET /api/quizzes?courseId=...
// Gets all quizzes for a specific course
router.get("/", async (req, res) => {
  try {
    const { courseId } = req.query;
    if (!courseId) {
      return res
        .status(400)
        .json({ message: "A courseId query parameter is required." });
    }

    // Find all quizzes that have the matching quizId
    const quizzes = await Quiz.find({ courseId }).select("title description");

    return res.json(quizzes);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error while fetching quizzes." });
  }
});

// GET /api/quizzes/list
// Get a list of all quizzes
router.get("/list", async (req, res) => {
  try {
    const quizzes = await Quiz.find().select("_id title description");

    return res.json(quizzes);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error while fetching quizzes." });
  }
});

// GET /api/quizzes/get-score
// Get the score of a given user on a given quiz
router.get("/quiz-score", requireAuth, async (req, res) => {
  let { quizId, userId } = req.query;

  if (!userId) {
    userId = req.user._id;
  } else if (req.user.role !== "admin") {
    return res
      .status(401)
      .json({ message: "User not allowed to perform this operation." });
  }

  try {
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const quizAttempt = await QuizAttempt.findOne({
      userId,
      quizId,
    });

    let status = "Not attempted";
    let score = 0;

    if (quizAttempt) {
      status = quizAttempt.completed ? "Started" : "Completed";
      score = (quizAttempt.currentScore / quiz.maxScore) * 100;
      score = parseFloat(score.toFixed(2));
    }

    return res.json({ status, score });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error while creating quiz." });
  }
});

// GET /api/quizzes/attemts
// Returns the number of users that have attempted the given quiz
router.get("/attempts", requireAuth, async (req, res) => {
  const { quizId } = req.query;

  if (req.user.role !== "admin") {
    return res
      .status(401)
      .json({ message: "User not allowed to perform this operation." });
  }

  try {
    return res.json({
      attemptCount: await QuizAttempt.countDocuments({ quizId }),
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error fetching number of attempts." });
  }
});

// GET /api/quizzes/:quizId
router.get("/:quizId", requireAuth, async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const quizAttempt = await QuizAttempt.findOne({
      userId: req.user._id,
      quizId: quizId,
    });

    return res.json({
      id: quiz._id.toString(),
      title: quiz.title,
      description: quiz.description,
      currentQuestion: quizAttempt ? quizAttempt.questionsAnswered : 0,
      currentScore: quizAttempt ? quizAttempt.currentScore : 0,
      // Map over questions to remove the correct answer before sending to the client
      questions: quiz.questions.map((q) => ({
        _id: q._id,
        title: q.title,
        type: q.type,
        value: q.value,
        options: q.options,
        ...(q.code !== undefined && { code: q.code }),
        ...(req.user.role === "admin" && { correctAnswer: q.correctAnswer }),
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
});

// POST /api/quizzes
router.post("/", async (req, res) => {
  try {
    const { title, description, courseId, questions } = req.body;

    // Basic validation to ensure required fields are present
    if (!title || !courseId || !questions) {
      return res.status(400).json({
        message:
          "Missing required fields: title, courseId, and questions are required.",
      });
    }

    const newQuiz = new Quiz({
      title,
      description,
      courseId,
      questions,
    });

    await newQuiz.save();
    return res.status(201).json(newQuiz);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error while creating quiz." });
  }
});

// PUT /api/quizzes/:quizId
router.put("/:quizId", async (req, res) => {
  try {
    const { quizId } = req.params;
    const { title, description, questions, deleteAttempts } = req.body;

    // Basic validation
    if (!title || !questions) {
      return res.status(400).json({
        message: "Missing required fields: title and questions are required.",
      });
    }

    if (deleteAttempts !== null && deleteAttempts) {
      await QuizAttempt.deleteMany({ quizId });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    quiz.title = title;
    quiz.description = description;
    quiz.questions = questions;

    const updatedQuiz = await quiz.save();

    return res.json(updatedQuiz);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error while updating quiz." });
  }
});

router.post("/submit-answer", requireAuth, async (req, res) => {
  // We will need to add user data here and some validations to store progress and grades
  try {
    const { quizId, questionIndex, answer } = req.body;

    // Basic validation to ensure required fields are present
    if (quizId === null || questionIndex === null || answer == null) {
      return res.status(400).json({
        message:
          "Missing required fields: quizId, questionIndex and answer are required.",
      });
    }

    const quiz = await Quiz.findById(quizId);

    if (quiz) {
      let quizAttempt = await QuizAttempt.findOne({
        userId: req.user._id,
        quizId: quizId,
      });

      if (!quizAttempt) {
        quizAttempt = new QuizAttempt({
          userId: req.user._id,
          quizId: quizId,
          courseId: quiz.courseId,
          completed: false, // Initial status
          questionsAnswered: 0,
          currentScore: 0,
          answers: [],
        });
      }

      const question = quiz.questions[questionIndex];
      if (question) {
        if (questionIndex !== quizAttempt.questionsAnswered) {
          return res.status(400).json({ message: "Question not allowed" });
        }

        quizAttempt.questionsAnswered++;

        let isCorrect = false;
        if (typeof answer === typeof question.correctAnswer) {
          if (typeof answer === String) {
            isCorrect = answer === question.correctAnswer;
          } else {
            isCorrect =
              answer.length === question.correctAnswer.length &&
              JSON.stringify([...answer].sort()) ===
              JSON.stringify([...question.correctAnswer].sort());
          }
        }

        if (quizAttempt.questionsAnswered === quiz.questions.length) {
          quizAttempt.completed = true;
        }

        const answerObj = {
          correct: isCorrect,
          score: isCorrect ? question.value : 0,
          answer,
        };

        quizAttempt.answers.push(answerObj);
        await quizAttempt.save();

        return res.json({
          correct: isCorrect,
          answer: question.correctAnswer,
        });
      } else {
        return res.status(404).json({ message: "Question not found" });
      }
    } else {
      return res.status(404).json({ message: "Quiz not found" });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error while creating quiz." });
  }
});

// TODO: REMOVE ON PROD
// This is only for bulk attempt creation
router.post("/no-auth-submit-answer", async (req, res) => {
  // We will need to add user data here and some validations to store progress and grades
  try {
    const { quizId, userId, questionIndex, answer } = req.body;

    // Basic validation to ensure required fields are present
    if (quizId === null || userId === null || questionIndex === null || answer == null) {
      return res.status(400).json({
        message:
          "Missing required fields: quizId, questionIndex and answer are required.",
      });
    }

    const quiz = await Quiz.findById(quizId);

    if (quiz) {
      let quizAttempt = await QuizAttempt.findOne({
        userId: userId,
        quizId: quizId,
      });

      if (!quizAttempt) {
        quizAttempt = new QuizAttempt({
          userId: userId,
          quizId: quizId,
          courseId: quiz.courseId,
          completed: false, // Initial status
          questionsAnswered: 0,
          currentScore: 0,
          answers: [],
        });
      }

      const question = quiz.questions[questionIndex];
      if (question) {
        if (questionIndex !== quizAttempt.questionsAnswered) {
          return res.status(400).json({ message: "Question not allowed" });
        }

        quizAttempt.questionsAnswered++;

        let isCorrect = false;
        if (typeof answer === typeof question.correctAnswer) {
          if (typeof answer === String) {
            isCorrect = answer === question.correctAnswer;
          } else {
            isCorrect =
              answer.length === question.correctAnswer.length &&
              JSON.stringify([...answer].sort()) ===
              JSON.stringify([...question.correctAnswer].sort());
          }
        }

        if (quizAttempt.questionsAnswered === quiz.questions.length) {
          quizAttempt.completed = true;
        }

        const answerObj = {
          correct: isCorrect,
          score: isCorrect ? question.value : 0,
          answer,
        };

        quizAttempt.answers.push(answerObj);
        await quizAttempt.save();

        return res.json({
          correct: isCorrect,
          answer: question.correctAnswer,
        });
      } else {
        return res.status(404).json({ message: "Question not found" });
      }
    } else {
      return res.status(404).json({ message: "Quiz not found" });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error while creating quiz." });
  }
});

export default router;
