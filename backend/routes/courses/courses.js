import express from "express";
import Course from "../../models/Course.js";
import Lesson from "../../models/Lesson.js";
import User from "../../models/User.js";
import Enrollment from "../../models/Enrollments.js";
import { requireAuth } from "../../../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role; 

    let courses = [];

    if (userRole === 'student') {
      const enrollments = await Enrollment.find({ student: userId }).populate('course');

      courses = enrollments.map(e => {
        if(!e.course) return null;
        return {
          ...e.course.toObject(),
          personalProgress: e.studentProgress
        };
      }).filter(c => c !== null);
    } else {
      courses = await Course.find({ owner: userId });
    }

    const courseIds = courses.map(c => c._id);

    const lessonsByCourse = await Lesson.aggregate([
      { $match: { courseId: { $in: courseIds } } },
      { $group: { _id: "$courseId", count: { $sum: 1 } } }
    ]);

    const lessonCountMap = {};
    lessonsByCourse.forEach((l) => {
      lessonCountMap[l._id.toString()] = l.count;
    });

    const enrollmentsByCourse = await Enrollment.aggregate([
      { $match: { course: { $in: courseIds } } },
      { $group: { _id: "$course", count: { $sum: 1 } } }
    ]);

    const studentCountMap = {};
    enrollmentsByCourse.forEach((e) => {
      studentCountMap[e._id.toString()] = e.count;
    });

    const formatted = courses.map((c) => ({
      id: c._id.toString(),
      name: c.title,
      description: c.description,
      category: c.category,
      lessons: lessonCountMap[c._id.toString()] || 0,
      studentsCount: studentCountMap[c._id.toString()] || 0, 
      personalProgress: c.personalProgress || 0
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

    const course = await Course.findById(courseId).populate('owner', 'name email');
    if (!course) return res.status(404).json({ message: "Course not found" });

    const isOwner = course.owner._id.toString() === userId;
    
    const enrollment = await Enrollment.findOne({ course: courseId, student: userId });
    const isStudent = !!enrollment;

    if (!isOwner && !isStudent) {
      return res.status(403).json({ message: "Access denied. Not enrolled." });
    }

    let studentEmails = [];
    if (isOwner) {
      const enrollments = await Enrollment.find({ course: courseId }).populate('student', 'email');
      studentEmails = enrollments.map(e => e.student.email);
    }

    res.json({
      id: course._id.toString(),
      title: course.title,
      description: course.description,
      progress: isStudent ? enrollment.studentProgress : course.progress,
      category: course.category,
      students: studentEmails
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

    const isOwner = course.owner.toString() === userId;
    const enrollment = await Enrollment.findOne({ course: courseId, student: userId });

    if (!isOwner && !enrollment) {
      return res.status(403).json({ message: "Access denied" });
    }

    const lessons = await Lesson.find({ courseId }).sort({ createdAt: 1 });
    const completedIds = enrollment ? enrollment.completedLessons.map(id => id.toString()) : [];
    
    const formatted = lessons.map((l) => ({
      _id: l._id,
      title: l.title,
      description: l.description,
      completed: completedIds.includes(l._id.toString()), 
      contents: l.contents,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, description, accessList, category } = req.body; 
    const newCourse = new Course({
      title,
      description,
      category,
      owner: userId,
    });

    await newCourse.save();

    let enrolledEmails = [];
    if (accessList && Array.isArray(accessList) && accessList.length > 0) {
        const foundUsers = await User.find({ email: { $in: accessList } });
        
        const enrollmentsToCreate = foundUsers.map(u => ({
            student: u._id,
            course: newCourse._id,
            completedLessons: [],
            studentProgress: 0
        }));

        if (enrollmentsToCreate.length > 0) {
            await Enrollment.insertMany(enrollmentsToCreate);
            enrolledEmails = foundUsers.map(u => u.email);
        }
    }

    res.status(201).json({
      id: newCourse._id,
      title: newCourse.title,
      description: newCourse.description,
      category: newCourse.category,
      owner: newCourse.owner,
      students: enrolledEmails
    });
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

    if(title) course.title = title;
    if(description) course.description = description;
    if(category) course.category = category;
    await course.save();

    if (students && Array.isArray(students)) {
      const targetUsers = await User.find({ email: { $in: students } });
      const targetUserIds = targetUsers.map(u => u._id.toString());
      
      const currentEnrollments = await Enrollment.find({ course: course._id });
      const currentStudentIds = currentEnrollments.map(e => e.student.toString());

      const toEnrollIds = targetUserIds.filter(id => !currentStudentIds.includes(id));
      
      if (toEnrollIds.length > 0) {
          const newEnrollments = toEnrollIds.map(sid => ({
              student: sid,
              course: course._id,
              completedLessons: [],
              studentProgress: 0
          }));
          await Enrollment.insertMany(newEnrollments);
      }
    }

    const updatedEnrollments = await Enrollment.find({ course: course._id }).populate('student', 'email');
    const updatedEmails = updatedEnrollments.map(e => e.student.email);

    res.json({
      id: course._id,
      title: course.title,
      description: course.description,
      category: course.category,
      students: updatedEmails
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const course = await Course.findById(req.params.id);

    if (!course) return res.status(404).json({ message: "Not found" });

    if (course.owner.toString() !== userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Lesson.deleteMany({ courseId: course._id });
    await Enrollment.deleteMany({ course: course._id });
    await course.deleteOne();

    res.json({ message: "Deleted course, lessons and enrollments" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;