import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  content: Object // flexible JSON: { video, pdf, exercise, quiz }
});

export default lessonSchema; // not a model, just schema
