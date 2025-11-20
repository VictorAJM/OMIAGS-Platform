import mongoose from "mongoose";

/**
 * Defines the structure for a single question within a quiz.
 * This will be used as a sub-document in the Quiz schema.
 */
const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A question title is required."],
  },
  type: {
    type: String,
    required: true,
    enum: [
      "multiple-choice",
      "true-false",
      "fill-in-the-blank",
      "multiple-answer",
      "complete-the-code",
    ],
  },
  value: {
    type: Number,
    default: 1,
  },
  options: {
    type: [String],
    default: undefined,
  },
  code: {
    type: String,
    default: undefined,
  },
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, "The correct answer is required."],
  },
});

/**
 * Defines the main Quiz schema.
 */
const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A quiz title is required."],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // CHANGED: Associates the quiz with a specific LESSON instead of a Course.
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    maxScore: {
      type: Number,
      default: 0,
    },
    questions: [questionSchema],
  },
  {
    timestamps: true,
  },
);

quizSchema.pre("save", function (next) {
  if (!this.isModified("questions")) return next();
  this.maxScore = this.questions.reduce(
    (total, question) => total + question.value,
    0,
  );
  return next();
});

export default mongoose.model("Quiz", quizSchema);
