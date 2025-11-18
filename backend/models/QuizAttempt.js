import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema({
  // ID del quiz
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true
  },

  // ID del usuario
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // ID del curso al que pertenece el quiz
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },

  // Is the quiz attempt finished
  completed: {
    type: Boolean,
    default: false,
  },

  questionsAnswered: {
    type: Number,
    default: 0  
  },

  currentScore: {
    type: Number,
    default: 0
  },

  answers: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  }
});

export default mongoose.model("QuizAttempt", quizAttemptSchema);
