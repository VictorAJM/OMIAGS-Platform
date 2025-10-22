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
  // The type of question determines how answers are structured and validated.
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
  // Points this question is worth.
  value: {
    type: Number,
    default: 1,
  },
  // Array of possible choices for multiple-choice or multiple-answer questions.
  options: {
    type: [String],
    default: undefined, // Will not be present unless it's a multiple-choice/answer question
  },
  code: {
    type: String,
    default: undefined, // Will not be present unless it's a multiple-choice/answer question
  },
  // The correct answer. The data type depends on the question `type`.
  // - 'multiple-choice': String (the correct option text)
  // - 'true-false': Boolean
  // - 'fill-in-the-blank': String
  // - 'multiple-answer': [String] (array of correct option texts)
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
    // Associates the quiz with a specific course.
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    // An array of questions, each following the questionSchema structure.
    questions: [questionSchema],
  },
  {
    // Automatically adds createdAt and updatedAt timestamps.
    timestamps: true,
  },
);

export default mongoose.model("Quiz", quizSchema);
