import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["video", "pdf", "text", "quiz"],
    required: true,
  },
  url: {
    type: String,
    required: function () {
      return this.type === "video" || this.type === "pdf";
    },
  },
  textContent: {
    type: String,
    required: function () {
      return this.type === "text";
    },
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: function () {
      return this.type === "quiz";
    },
  },
});

export default contentSchema;
