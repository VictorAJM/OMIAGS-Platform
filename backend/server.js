import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import courseRoutes from "./routes/courses/courses.js";
import lessonRoutes from "./routes/lessons/lessons.js";
import quizRoutes from "./routes/quizzes/quizzes.js";
import authRoutes from "./routes/auth/auth.js";
import userRoutes from "./routes/user/user.js";
import enrollmentRoutes from "./routes/enrollments/enrollments.js";
import uploadRoutes from "./routes/upload/upload.js";

dotenv.config();
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(
  cors({
    origin: [
      "https://omiags.online",
      "https://www.omiags.online",
      "https://www.omiags.online",
      "http://localhost:5173",
    ],
    credentials: true,
  }),
);
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error(err));

app.get("/health", (_req, res) => res.send("ok"));

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/user", userRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/upload", uploadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 API lista en puerto ${PORT}`));
