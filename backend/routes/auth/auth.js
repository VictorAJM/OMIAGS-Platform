// backend/routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";          // 👈 IMPORTANTE
import User from "../../models/User.js";

const router = express.Router();

const JWT_SECRET  = process.env.JWT_SECRET || "cambia-esto";
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
      { expiresIn: JWT_EXPIRES }
    );

    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (e) {
    console.error("LOGIN ERROR:", e);    // 👈 LOG PARA VER EL MOTIVO REAL
    return res.status(500).json({ error: "Error interno" });
  }
});
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};

    // Validaciones básicas
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Faltan campos" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
    }

    // ¿ya existe?
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    // Crear usuario (el hash lo hace el pre('save') del modelo)
    const user = await User.create({ name, email, password, role: "user" });

    // Opcional: iniciar sesión automática (emitimos token)
    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
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
