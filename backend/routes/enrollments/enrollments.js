import express from "express";
import Enrollment from "../../models/Enrollments.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const getUserIdFromRequest = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    const token = authHeader.split(" ")[1];
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "tu_secreto_jwt");
    return decoded.id || decoded._id || decoded.userId; 
  } catch (error) {
    console.error("Error decodificando token:", error.message);
    return null;
  }
};

// GET /api/enrollments/status/:courseId
// Obtiene el progreso del usuario actual en un curso específico
router.get("/status/:courseId", async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    
    if (!userId) {
      return res.status(401).json({ message: "Acceso no autorizado. Token inválido o ausente." });
    }

    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({ 
      student: userId, 
      course: courseId 
    });

    if (!enrollment) {
      return res.json({ 
        completedLessons: [], 
        studentProgress: 0 
      });
    }

    res.json({
      completedLessons: enrollment.completedLessons,
      studentProgress: enrollment.studentProgress
    });

  } catch (err) {
    console.error("Error obteniendo estado de inscripción:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
});

export default router;