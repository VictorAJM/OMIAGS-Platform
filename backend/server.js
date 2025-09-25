import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import courseRoutes from "./routes/courses/courses.js";
import lessonRoutes from "./routes/lessons/lessons.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error(err));

app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
