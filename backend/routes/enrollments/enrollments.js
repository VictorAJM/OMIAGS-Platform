import express from "express";
import Enrollment from "../../models/Enrollments.js";
import Course from "../../models/Course.js";
import Quiz from "../../models/Quiz.js";
import QuizAttempt from "../../models/QuizAttempt.js";
import Lesson from "../../models/Lesson.js"; 
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

// GET /api/enrollments/my-students
// Robust version: Fetches students, progress, and quiz grades in separate steps to avoid empty results.
router.get("/my-students", requireAuth, async (req, res) => {
  console.log("--- Starting /my-students fetch ---");
  try {
    const instructorId = req.user._id;

    // STEP 1: Find Instructor's Courses
    const myCourses = await Course.find({ owner: instructorId }).select("_id title");
    console.log(`1. Found ${myCourses.length} courses for instructor.`);
    
    if (myCourses.length === 0) return res.json([]); // No courses = No students

    const myCourseIds = myCourses.map(c => c._id);

    // STEP 2: Find Enrollments (The Students)
    const enrollments = await Enrollment.find({ course: { $in: myCourseIds } })
      .populate("student", "name email")
      .populate("course", "title")
      .lean();
      
    console.log(`2. Found ${enrollments.length} enrollments.`);

    if (enrollments.length === 0) return res.json([]);

    // STEP 3: Prepare to calculate Quiz Grades
    // We need to find all quizzes related to these courses to calculate averages.
    
    // 3a. Find Lessons for these courses
    const lessons = await Lesson.find({ courseId: { $in: myCourseIds } }).select("_id courseId");
    const lessonIds = lessons.map(l => l._id);
    
    // 3b. Find Quizzes for these lessons
    const quizzes = await Quiz.find({ lessonId: { $in: lessonIds } }).select("_id lessonId maxScore");
    const quizIds = quizzes.map(q => q._id);

    // 3c. Map Quiz ID -> Course ID (So we know which course a quiz score belongs to)
    // Structure: { "quizId_123": "courseId_ABC" }
    const quizToCourseMap = {};
    quizzes.forEach(quiz => {
      const lesson = lessons.find(l => l._id.toString() === quiz.lessonId.toString());
      if (lesson) {
        quizToCourseMap[quiz._id.toString()] = lesson.courseId.toString();
      }
    });

    // 3d. Find ALL attempts for these quizzes by the enrolled students
    const studentIds = enrollments.map(e => e.student._id);
    const attempts = await QuizAttempt.find({
      userId: { $in: studentIds },
      quizId: { $in: quizIds },
      completed: true // We only count finished attempts
    }).lean();

    console.log(`3. Found ${attempts.length} quiz attempts.`);

    // STEP 4: Aggregate Data in Memory
    const studentsMap = new Map();

    enrollments.forEach(enrollment => {
      // Safety check for missing populated data
      if (!enrollment.student || !enrollment.course) return;

      const studentId = enrollment.student._id.toString();
      const courseId = enrollment.course._id.toString();

      // Initialize student in map if not exists
      if (!studentsMap.has(studentId)) {
        studentsMap.set(studentId, {
          name: enrollment.student.name,
          email: enrollment.student.email,
          totalLessonProgress: 0,
          courseCount: 0,
          courses: new Set(),
          // For Quiz Averages
          totalQuizPercentageSum: 0, // Sum of averages of each course
          coursesWithQuizzes: 0
        });
      }

      const entry = studentsMap.get(studentId);

      // A. Process Lesson Progress (from Enrollment)
      entry.totalLessonProgress += (enrollment.studentProgress || 0);
      entry.courseCount += 1;
      entry.courses.add(enrollment.course.title);

      // B. Process Quiz Grades for THIS specific course
      // Filter attempts for this student AND this course
      const studentCourseAttempts = attempts.filter(a => 
        a.userId.toString() === studentId && 
        quizToCourseMap[a.quizId.toString()] === courseId
      );

      if (studentCourseAttempts.length > 0) {
        // Calculate average score for this specific course
        let totalScorePct = 0;
        
        studentCourseAttempts.forEach(att => {
            // Find maxScore for this quiz to calculate percentage
            const quizRef = quizzes.find(q => q._id.toString() === att.quizId.toString());
            const max = (quizRef && quizRef.maxScore) ? quizRef.maxScore : 100; 
            // (Fallback to 100 if maxScore is missing to avoid Infinity)
            
            const pct = (att.currentScore / max) * 100;
            totalScorePct += pct;
        });

        const courseAverage = totalScorePct / studentCourseAttempts.length;
        
        entry.totalQuizPercentageSum += courseAverage;
        entry.coursesWithQuizzes += 1;
      }
    });

    // STEP 5: Final Array Construction
    const result = Array.from(studentsMap.entries()).map(([id, data]) => {
      const avgLesson = data.courseCount > 0 
        ? Math.round(data.totalLessonProgress / data.courseCount) 
        : 0;

      // If student has taken quizzes in any course, calculate average across those courses
      const avgQuiz = data.coursesWithQuizzes > 0 
        ? Math.round(data.totalQuizPercentageSum / data.coursesWithQuizzes) 
        : 0;

      return {
        id: id,
        name: data.name,
        email: data.email,
        lessonProgress: avgLesson,
        quizAverage: avgQuiz,
        courses: Array.from(data.courses).slice(0, 3),
        totalCourses: data.courseCount
      };
    });

    console.log(`4. Returning ${result.length} aggregated students.`);
    res.json(result);

  } catch (err) {
    console.error("Error in /my-students:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
