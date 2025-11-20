import express from "express";
import Enrollment from "../../models/Enrollments.js";
import { requireAuth } from "../../../middleware/auth.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// GET /api/enrollments/status/:courseId
// Obtiene el progreso del usuario actual en un curso específico
router.get("/status/:courseId", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Acceso no autorizado. Token inválido o ausente." });
    }

    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({
      student: userId,
      course: courseId,
    });

    if (!enrollment) {
      return res.json({
        completedLessons: [],
        studentProgress: 0,
      });
    }

    res.json({
      completedLessons: enrollment.completedLessons,
      studentProgress: enrollment.studentProgress,
    });
  } catch (err) {
    console.error("Error obteniendo estado de inscripción:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// GET /api/enrollments/all
// Obtiene TODAS las inscripciones de TODOS los usuarios (Vista Admin/Reportes)
router.get("/all", requireAuth, async (req, res) => {
  try {
    const allEnrollments = await Enrollment.find()
      .populate("student", "name email")
      .populate("course", "title category")
      .sort({ createdAt: -1 });

    res.json(allEnrollments);
  } catch (err) {
    console.error("Error obteniendo todas las inscripciones:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
});

export default router;
