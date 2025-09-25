import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  accessList: [mongoose.Schema.Types.ObjectId] // IDs of users who can access
});

export default mongoose.model("Course", courseSchema);
