// middlewares/auth.middleware.js

import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error("JWT_SECRET no está definido en las variables de entorno");
}

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Token no proporcionado" });
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }

    // Pass information to next controller
    req.user = decoded;
    next();
  });
};

export const optionalAuth = (req, _res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return next();

  jwt.verify(token, SECRET, (err, decoded) => {
    if (!err) req.user = decoded;
    next();
  });
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.rol === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Requiere rol de Administrador" });
};
