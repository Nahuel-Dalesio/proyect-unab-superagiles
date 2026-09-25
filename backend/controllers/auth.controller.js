import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByUsername } from "../models/auth.model.js";
import dotenv from "dotenv";

dotenv.config();

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error("JWT_SECRET no está definido en las variables de entorno");
}

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Usuario y contraseña requeridos" });
  }

  try {
    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    if (user.activo === false) {
      return res.status(403).json({ message: "Usuario inactivo. Contactá al administrador." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: user.idUsuario, username: user.username, rol: user.rol },
      SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Login exitoso",
      token,
      user: {
        username: user.username,
        rol: user.rol,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesión", error: error.message });
  }
};
