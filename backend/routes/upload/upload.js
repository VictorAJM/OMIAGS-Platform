import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// 1. Ensure upload directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 2. Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique name: timestamp-originalName.pdf
    // remove spaces to avoid URL issues
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, uniqueName);
  },
});

// Filter to only allow PDFs (optional but recommended)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDFs are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // Limit to 500MB
});

// 3. The POST Endpoint
router.post("/", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Return the full URL so the frontend can save it to MongoDB
    // Note: ensure PORT matches your env or default 5000
    const port = process.env.PORT || 5000;
    const fileUrl = `https://www.omiags.online/uploads/${req.file.filename}`;

    res.status(200).json({ url: fileUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
