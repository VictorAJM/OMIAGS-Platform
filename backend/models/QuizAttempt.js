import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  // ID del quiz
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true
  },

  // ID del curso al que pertenece el quiz
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },

  // ID del usuario
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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

  selectedAnswsers: {
    type: mongoose.Schema.Types.Mixed
  }
});

export default mongoose.model("Course", courseSchema);
