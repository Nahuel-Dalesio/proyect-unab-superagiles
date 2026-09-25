// seed.js
// Corre esto UNA sola vez para crear el usuario admin inicial.
// Uso: node seed.js
//
// Requiere que la tabla "usuario" ya exista (ver seed-usuario.sql)
// y que las variables de entorno de conexion a MySQL esten configuradas.

import bcrypt from "bcryptjs";
import pool from "../bd/conexion.js";

const USERS_TO_SEED = [
  { username: "admin", password: "admin123", rol: "admin" },
  { username: "cajero1", password: "cajero123", rol: "cajero" },
];

async function seedAdmin() {
  try {
    for (const u of USERS_TO_SEED) {
      const [existing] = await pool.query(
        "SELECT idUsuario FROM usuario WHERE username = ?",
        [u.username]
      );

      if (existing.length > 0) {
        console.log(`El usuario ${u.username} ya existe, no se creo de nuevo.`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(u.password, 10);

      await pool.query(
        "INSERT INTO usuario (username, password, rol, activo) VALUES (?, ?, ?, true)",
        [u.username, hashedPassword, u.rol]
      );

      console.log(`Usuario ${u.rol} creado. username: ${u.username} / password: ${u.password}`);
    }

    console.log("IMPORTANTE: cambiar estas contraseñas despues del primer login (o al menos antes de entregar el TP).");
    process.exit(0);
  } catch (error) {
    console.error("Error al crear usuarios:", error);
    process.exit(1);
  }
}

seedAdmin();