import pool from "../bd/conexion.js";

export const findUserByUsername = async (username) => {
  const [rows] = await pool.query("SELECT * FROM usuario WHERE username = ?", [username]);
  return rows[0];
};

// NOTA: se deja esta funcion comentada como referencia para cuando se implemente
// la creacion de cajeros por parte del Admin (fuera del alcance del Sprint 1).
// Habria que adaptarla: sacar la parte de "cliente" (no aplica al kiosco),
// y protegerla con verifyToken + isAdmin en la ruta correspondiente.
//
// export const createUser = async ({ username, hashedPassword, rol }) => {
//   const [result] = await pool.query(
//     "INSERT INTO usuario (username, password, rol, activo) VALUES (?, ?, ?, true)",
//     [username, hashedPassword, rol]
//   );
//   return result.insertId;
// };
