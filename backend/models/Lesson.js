import mongoose from "mongoose";
import contentSchema from "./Content.js";

const lessonSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  title: { type: String, required: true },
  description: String,
  // Array de subdocumentos usando el esquema definido arriba
  contents: [contentSchema], 
  completed: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.model("Lesson", lessonSchema);