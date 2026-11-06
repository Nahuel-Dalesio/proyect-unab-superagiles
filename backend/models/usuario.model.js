import pool from "../bd/conexion.js";

const USER_FIELDS = `
  idUsuario,
  username,
  rol,
  activo
`;

export const findUsers = async (search = "") => {
  const searchPattern = `%${search}%`;

  const [rows] = await pool.query(
    `SELECT ${USER_FIELDS}
     FROM usuario
     WHERE username LIKE ?
        OR rol LIKE ?
     ORDER BY username ASC`,
    [searchPattern, searchPattern]
  );

  return rows;
};

export const findUserById = async (idUsuario) => {
  const [rows] = await pool.query(
    `SELECT ${USER_FIELDS}
     FROM usuario
     WHERE idUsuario = ?`,
    [idUsuario]
  );

  return rows[0];
};

export const findUserByUsernameForManagement = async (
  username,
  excludeId = null
) => {
  if (excludeId !== null) {
    const [rows] = await pool.query(
      `SELECT idUsuario
       FROM usuario
       WHERE username = ?
         AND idUsuario <> ?`,
      [username, excludeId]
    );

    return rows[0];
  }

  const [rows] = await pool.query(
    `SELECT idUsuario
     FROM usuario
     WHERE username = ?`,
    [username]
  );

  return rows[0];
};

export const createUser = async ({
  username,
  hashedPassword,
  rol,
  activo,
}) => {
  const [result] = await pool.query(
    `INSERT INTO usuario (username, password, rol, activo)
     VALUES (?, ?, ?, ?)`,
    [username, hashedPassword, rol, activo]
  );

  return result.insertId;
};

const UPDATABLE_COLUMNS = {
  username: "username",
  password: "password",
  rol: "rol",
  activo: "activo",
};

export const updateUserById = async (idUsuario, changes) => {
  const fields = Object.keys(changes).filter(
    (key) => key in UPDATABLE_COLUMNS
  );

  if (fields.length === 0) return 0;

  const setClause = fields
    .map((key) => `${UPDATABLE_COLUMNS[key]} = ?`)
    .join(", ");

  const values = fields.map((key) => changes[key]);

  const [result] = await pool.query(
    `UPDATE usuario
     SET ${setClause}
     WHERE idUsuario = ?`,
    [...values, idUsuario]
  );

  return result.affectedRows;
};