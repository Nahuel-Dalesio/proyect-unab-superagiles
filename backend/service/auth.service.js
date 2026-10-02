import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { findUserByUsername } from "../models/auth.model.js";

dotenv.config();

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error("JWT_SECRET no está definido en las variables de entorno");
}

// Error de negocio: el service no conoce HTTP, solo expone un "code".
// El controller decide qué status devolver según ese code.
export class AuthError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

export const loginUser = async (username, password) => {
  const user = await findUserByUsername(username);
  if (!user) {
    throw new AuthError("INVALID_CREDENTIALS", "Credenciales inválidas");
  }

  if (!user.activo) {
    throw new AuthError(
      "USER_INACTIVE",
      "Usuario inactivo. Contactá al administrador."
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AuthError("INVALID_CREDENTIALS", "Credenciales inválidas");
  }

  const token = jwt.sign(
    { id: user.idUsuario, username: user.username, rol: user.rol },
    SECRET,
    { expiresIn: "8h" }
  );

  return {
    token,
    user: {
      username: user.username,
      rol: user.rol,
    },
  };
};