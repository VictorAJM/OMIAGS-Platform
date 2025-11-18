import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,

  // IDs de usuarios que pueden acceder
  accessList: [mongoose.Schema.Types.ObjectId],

  // Dueño del curso (obligatorio)
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Categoría obligatoria
  category: {
    type: String,
    enum: ["Secundaria", "Preparatoria"],
    required: true,
  },

  progress: { type: Number, default: 0 },
});

export default mongoose.model("Course", courseSchema);
