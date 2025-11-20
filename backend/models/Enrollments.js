import mongoose from "mongoose";
import Lesson from "./Lesson.js";
import Course from "./Course.js";


const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },

  completedLessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lesson"
  }],

  studentProgress: {
    type: Number,
    default: 0
  }
}, { timestamps: true });


enrollmentSchema.pre("save", async function (next) {
  if (!this.isModified("completedLessons")) return next();
  try {
    const totalLessons = await Lesson.countDocuments({ courseId: this.course });
    if (totalLessons === 0) {
      this.studentProgress = 0;
    } else {
      const completedCount = this.completedLessons.length;
      this.studentProgress = (completedCount / totalLessons) * 100;
      if (this.studentProgress > 100) this.studentProgress = 100;
    }
    next();
  } catch (error) {
    next(error);
  }
});


enrollmentSchema.post("save", async function (doc, next) {
  try {
    const stats = await mongoose.model("Enrollment").aggregate([
      { $match: { course: doc.course } },
      {
        $group: {
          _id: "$course",
          averageProgress: { $avg: "$studentProgress" }
        }
      }
    ]);
    if (stats.length > 0) {
      await Course.findByIdAndUpdate(doc.course, {
        progress: Math.round(stats[0].averageProgress * 100) / 100
      });
    } else {
      await Course.findByIdAndUpdate(doc.course, { progress: 0 });
    }
    if (next) next(); 
  } catch (error) {
    console.error("Error actualizando el progreso del curso:", error);
  }
});

export default mongoose.model("Enrollment", enrollmentSchema);