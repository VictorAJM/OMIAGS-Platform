// backend/routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import { requireAuth } from "../../../middleware/auth.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "cambia-esto";
const JWT_EXPIRES = "7d";

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ error: "Faltan campos" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const ok = await user.validatePassword(password);
    if (!ok) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      message: "Login exitoso",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (e) {
    console.error("LOGIN ERROR:", e); // 👈 LOG PARA VER EL MOTIVO REAL
    return res.status(500).json({ error: "Error interno" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "Logout exitoso" });
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};

    // Validaciones básicas
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Faltan campos" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "La contraseña debe tener al menos 8 caracteres" });
    }

    // ¿ya existe?
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    // Crear usuario (el hash lo hace el pre('save') del modelo)
    const user = await User.create({ name, email, password, role: "student" });

    // Opcional: iniciar sesión automática (emitimos token)
    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({
      message: "Registro exitoso",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (e) {
    // Duplicado por índice único (por si dos requests chocan)
    if (e?.code === 11000) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }
    console.error("REGISTER ERROR:", e);
    return res.status(500).json({ error: "Error interno" });
  }
});

// ✅ GET /api/auth/me — get current user info
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "No token" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.sub).select(
      "name email role updatedAt",
    );
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    console.log(user.updatedAt);

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      lastUpdate: user.updatedAt,
    });
  } catch (e) {
    console.error("ME ERROR:", e);
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
});

// PUT /api/auth/change-password
// Endpoint to change account passoword.
// Requires auth.
router.put("/change-password", requireAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body ?? {};

    // Validaciones básicas
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Faltan campos" });
    }

    const user_id = req.user._id;
    console.log(user_id);
    const user = await User.findById(user_id);
    const ok = await user.validatePassword(oldPassword);

    if (!ok) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: "La contraseña nueva debe tener al menos 8 caracteres",
      });
    }

    user.password = newPassword;
    user.save();

    // Opcional: iniciar sesión automática (emitimos token)
    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({
      message: "Contraseña actualizada",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (e) {
    // Duplicado por índice único (por si dos requests chocan)
    if (e?.code === 11000) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }
    console.error("REGISTER ERROR:", e);
    return res.status(500).json({ error: "Error interno" });
  }
});

export default router;
