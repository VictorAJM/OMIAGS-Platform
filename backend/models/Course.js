import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  accessList: [mongoose.Schema.Types.ObjectId] // IDs of users who can access
});

export default mongoose.model("Course", courseSchema);
