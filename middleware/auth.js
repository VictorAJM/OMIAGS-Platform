// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../backend/models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "cambia-esto";

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.sub).select("name email role");
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    req.user = user; // attach user object
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
