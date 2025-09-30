import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["video", "pdf", "exercise", "quiz"],
    required: true,
  },
  title: { type: String, required: true },
  url: { type: String }, // e.g., video link, pdf link, exercise path
  data: { type: mongoose.Schema.Types.Mixed }, 
  // for flexible objects, e.g. quiz questions
});

export default contentSchema;