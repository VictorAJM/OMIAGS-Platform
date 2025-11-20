import express from "express";
import Lesson from "../../models/Lesson.js";

const router = express.Router();

// Helper para validar que el contenido tenga sentido según su tipo
const validateContent = (contents) => {
  if (!Array.isArray(contents)) return "Contents must be an array";
  
  for (let item of contents) {
    if (!item.title) return "All contents must have a title";
    if (!['video', 'pdf', 'text', 'quiz'].includes(item.type)) {
      return `Invalid content type: ${item.type}`;
    }
    if ((item.type === 'video' || item.type === 'pdf') && !item.url) {
      return `Content "${item.title}" requires a URL`;
    }
    if (item.type === 'text' && !item.textContent) {
      return `Content "${item.title}" requires textContent`;
    }
    if (item.type === 'quiz' && !item.quizId) {
      return `Content "${item.title}" requires a quizId`;
    }
  }
  return null; // null significa que no hay error
};

// GET /api/lessons/:id
router.get("/:id", async (req, res) => {
  try {
    // Si quieres ver los detalles del quiz dentro de la lección, añade otro populate:
    // .populate("contents.quizId")
    const lesson = await Lesson.findById(req.params.id).populate("courseId");
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/lessons/:courseId/lessons (Listar lecciones de un curso)
router.get("/:courseId/lessons", async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await Lesson.find({ courseId })
      .sort({ createdAt: 1 }); // Ordenar por creación usualmente es útil
    res.json(lessons);
  } catch (err) {
    console.error("Error fetching lessons:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/lessons
router.post("/", async (req, res) => {
  try {
    const { courseId, title, description, contents } = req.body;
    
    if (!courseId || !title)
      return res.status(400).json({ message: "courseId and title required" });

    // Validar estructura de contenidos
    if (contents && contents.length > 0) {
      const error = validateContent(contents);
      if (error) return res.status(400).json({ message: error });
    }

    const lesson = new Lesson({ courseId, title, description, contents });
    await lesson.save();
    res.status(201).json(lesson);
  } catch (err) {
    console.error("Error creating lesson:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/lessons/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, contents } = req.body;

    const lesson = await Lesson.findById(id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    if (title !== undefined) lesson.title = title;
    if (description !== undefined) lesson.description = description;
    
    if (contents !== undefined) {
       const error = validateContent(contents);
       if (error) return res.status(400).json({ message: error });
       lesson.contents = contents;
    }

    await lesson.save();
    res.json({ message: "Lesson updated", lesson });
  } catch (err) {
    console.error("Error updating lesson:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/lessons/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await Lesson.findByIdAndDelete(id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json({ message: "Lesson deleted" });
  } catch (err) {
    console.error("Error deleting lesson:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/lessons/:id/completed
router.put("/:id/completed", async (req, res) => {
  try {
    const { completed } = req.body;
    if (typeof completed !== "boolean") {
      return res.status(400).json({ message: "Completed must be boolean" });
    }
    const updatedLesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { completed },
      { new: true }
    );
    if (!updatedLesson) return res.status(404).json({ message: "Lesson not found" });
    res.json(updatedLesson);
  } catch (err) {
    console.error("Error updating lesson:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/lessons/content/:contentId
// Obtiene un contenido específico (subdocumento) buscándolo dentro de las lecciones
router.get("/content/:contentId", async (req, res) => {
  try {
    const { contentId } = req.params;
    // Buscamos la lección que contiene este contentId y proyectamos solo ese elemento del array
    const lesson = await Lesson.findOne(
      { "contents._id": contentId },
      { "contents.$": 1, title: 1, courseId: 1 } // Traemos el título de la lección también para contexto
    );

    if (!lesson || !lesson.contents || lesson.contents.length === 0) {
      return res.status(404).json({ message: "Contenido no encontrado" });
    }

    // Devolvemos el objeto del contenido junto con info básica de la lección padre
    const contentData = lesson.contents[0];
    res.json({
      ...contentData.toObject(),
      lessonTitle: lesson.title,
      lessonId: lesson._id,
      courseId: lesson.courseId
    });
  } catch (err) {
    console.error("Error fetching content:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;