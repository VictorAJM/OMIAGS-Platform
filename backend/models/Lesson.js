import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  title: { type: String, required: true },
  description: String,
  content: Object // flexible JSON: { video, pdf, exercise, quiz }
});

export default mongoose.model("Lesson", lessonSchema);
