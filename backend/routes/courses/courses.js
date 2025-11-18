import express from "express";
import Course from "../../models/Course.js";
import Lesson from "../../models/Lesson.js";
import User from "../../models/User.js";
import { requireAuth } from "../../../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    const courses = await Course.find({ owner: userId }).populate(
      "accessList",
      "email",
    );

    const lessonsByCourse = await Lesson.aggregate([
      { $match: { courseId: { $in: courses.map((c) => c._id) } } },
      { $group: { _id: "$courseId", count: { $sum: 1 } } },
    ]);

    const lessonCountMap = {};
    lessonsByCourse.forEach((l) => {
      lessonCountMap[l._id.toString()] = l.count;
    });

    const formatted = courses.map((c) => ({
      id: c._id.toString(),
      name: c.title,
      description: c.description,
      category: c.category,
      lessons: lessonCountMap[c._id.toString()] || 0,
      students: c.accessList ? c.accessList.map((u) => u.email) : [],
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error getting courses:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/:courseId", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate(
      "accessList",
      "email name",
    );

    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.owner?.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({
      id: course._id.toString(),
      title: course.title,
      description: course.description,
      progress: course.progress,
      category: course.category,
      students: course.accessList ? course.accessList.map((u) => u.email) : [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:courseId/lessons", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.owner?.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const lessons = await Lesson.find({ courseId });

    const formatted = lessons.map((l) => ({
      id: l._id.toString(),
      title: l.title,
      description: l.description,
      completed: l.completed,
      contents: l.contents,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, description, accessList, category } = req.body;

    let initialStudents = [];

    if (accessList && Array.isArray(accessList) && accessList.length > 0) {
      const foundUsers = await User.find({ email: { $in: accessList } });
      initialStudents = foundUsers.map((u) => u._id);
    }

    const newCourse = new Course({
      title,
      description,
      category,
      accessList: initialStudents,
      owner: userId,
    });

    await newCourse.save();

    res.status(201).json({
      id: newCourse._id,
      title: newCourse.title,
      description: newCourse.description,
      category: newCourse.category,
      owner: newCourse.owner,
      progress: newCourse.progress,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const course = await Course.findById(req.params.id);

    if (!course) return res.status(404).json({ message: "Not found" });

    if (course.owner && course.owner.toString() !== userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Lesson.deleteMany({ courseId: course._id });

    await course.deleteOne();
    res.json({ message: "Deleted course and associated lessons" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { title, description, category, students } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Not found" });

    if (course.owner.toString() !== userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    let validUserIds = course.accessList; // Initially holds existing IDs

    if (students && Array.isArray(students) && students.length > 0) {
      const foundUsers = await User.find({ email: { $in: students } });

      // Check for missing emails
      const foundEmails = foundUsers.map((u) => u.email);
      const missingEmails = students.filter(
        (email) => !foundEmails.includes(email),
      );

      if (missingEmails.length > 0) {
        return res.status(400).json({
          message: `No se encontraron usuarios con los siguientes correos: ${missingEmails.join(", ")}`,
        });
      }

      const newStudentIds = foundUsers.map((u) => u._id.toString());
      const existingIds = course.accessList.map((id) => id.toString());

      const mergedIds = new Set([...existingIds, ...newStudentIds]);
      validUserIds = Array.from(mergedIds);
    }

    course.title = title || course.title;
    course.description = description || course.description;
    course.category = category || course.category;

    if (students) {
      course.accessList = validUserIds;
    }

    await course.save();

    await course.populate("accessList", "email name");

    res.json({
      id: course._id,
      title: course.title,
      description: course.description,
      category: course.category,
      progress: course.progress,
      students: course.accessList.map((u) => u.email),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
