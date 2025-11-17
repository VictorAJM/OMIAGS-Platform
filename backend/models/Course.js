import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,

  // IDs de usuarios que tienen acceso
  accessList: [mongoose.Schema.Types.ObjectId],

  // Categoría del curso
  category: {
    type: String,
    enum: ["Secundaria", "Preparatoria"],
    required: true,
  },

  progress: { type: Number, default: 0 },
});

export default mongoose.model("Course", courseSchema);
