import mongoose from "mongoose";

const quizAnswerSchema = new mongoose.Schema({
  correct: {
    type: Boolean,
    required: true,
  },

  score: {
    type: Number,
    required: true,
  },

  answer: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
});

const quizAttemptSchema = new mongoose.Schema({
  // ID del quiz
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },

  // ID del usuario
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // ID del curso al que pertenece el quiz
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lesson",
    required: true,
  },

  // Is the quiz attempt finished
  completed: {
    type: Boolean,
    default: false,
  },

  questionsAnswered: {
    type: Number,
    default: 0,
  },

  currentScore: {
    type: Number,
    default: 0,
  },

  answers: {
    type: [quizAnswerSchema],
    default: [],
  },
});

quizAttemptSchema.pre("save", function (next) {
  if (this.answers.length > 0) {
    this.completed = true;
    this.currentScore = this.answers.reduce(
      (total, answer) => total + answer.score,
      0,
    );
  }
  next();
});

export default mongoose.model("QuizAttempt", quizAttemptSchema);
