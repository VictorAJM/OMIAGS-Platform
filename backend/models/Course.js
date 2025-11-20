import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: String,
      enum: ["Secundaria", "Preparatoria"],
      required: true,
    },

    progress: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("Course", courseSchema);
