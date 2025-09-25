import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  accessList: [mongoose.Schema.Types.ObjectId], // IDs of users who can access
  progress: { type: Number, default: 0 }, // optional
});

export default mongoose.model("Course", courseSchema);
