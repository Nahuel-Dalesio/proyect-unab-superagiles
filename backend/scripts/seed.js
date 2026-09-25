// seed.js
// Corre esto UNA sola vez para crear el usuario admin inicial.
// Uso: node seed.js
//
// Requiere que la tabla "usuario" ya exista (ver seed-usuario.sql)
// y que las variables de entorno de conexion a MySQL esten configuradas.

import bcrypt from "bcryptjs";
import pool from "../bd/conexion.js";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123"; // cambiar despues del primer login

async function seedAdmin() {
  try {
    const [existing] = await pool.query(
      "SELECT idUsuario FROM usuario WHERE username = ?",
      [ADMIN_USERNAME]
    );

    if (existing.length > 0) {
      console.log("El usuario admin ya existe, no se creo de nuevo.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await pool.query(
      "INSERT INTO usuario (username, password, rol, activo) VALUES (?, ?, 'admin', true)",
      [ADMIN_USERNAME, hashedPassword]
    );

    console.log(`Usuario admin creado. username: ${ADMIN_USERNAME} / password: ${ADMIN_PASSWORD}`);
    console.log("IMPORTANTE: cambiar esta contraseña despues del primer login (o al menos antes de entregar el TP).");
    process.exit(0);
  } catch (error) {
    console.error("Error al crear el usuario admin:", error);
    process.exit(1);
  }
}

seedAdmin();
