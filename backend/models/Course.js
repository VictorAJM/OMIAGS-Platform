import mongoose from "mongoose";
import lessonSchema from "./Lesson.js";

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  accessList: [mongoose.Schema.Types.ObjectId], // IDs of users who can access
  lessons: [lessonSchema] // embed lessons
});

export default mongoose.model("Course", courseSchema);
