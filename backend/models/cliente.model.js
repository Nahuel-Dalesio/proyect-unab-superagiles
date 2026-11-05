import pool from "../bd/conexion.js";

const CLIENT_FIELDS = `
  id_cliente,
  nombre,
  apellido,
  tipo_documento,
  numero_documento,
  email,
  telefono,
  direccion,
  activo
`;

export const findClients = async (search = "") => {
  const searchPattern = `%${search}%`;

  const [rows] = await pool.query(
    `SELECT ${CLIENT_FIELDS}
     FROM clientes
     WHERE nombre LIKE ?
        OR apellido LIKE ?
        OR numero_documento LIKE ?
        OR email LIKE ?
     ORDER BY nombre ASC, apellido ASC`,
    [searchPattern, searchPattern, searchPattern, searchPattern]
  );

  return rows;
};

export const findClientById = async (idCliente) => {
  const [rows] = await pool.query(
    `SELECT ${CLIENT_FIELDS}
     FROM clientes
     WHERE id_cliente = ?`,
    [idCliente]
  );

  return rows[0];
};

export const findClientByDocument = async (
  numeroDocumento,
  excludeId = null
) => {
  let query =
    "SELECT * FROM clientes WHERE numero_documento = ?";
  const values = [numeroDocumento];

  if (excludeId !== null) {
    query += " AND id_cliente <> ?";
    values.push(excludeId);
  }

  const [rows] = await pool.query(query, values);

  return rows[0];
};

export const createClient = async ({
  nombre,
  apellido,
  tipo_documento,
  numero_documento,
  email,
  telefono,
  direccion,
}) => {
  const [result] = await pool.query(
    `INSERT INTO clientes
      (nombre, apellido, tipo_documento, numero_documento, email, telefono, direccion)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      nombre,
      apellido,
      tipo_documento,
      numero_documento,
      email,
      telefono,
      direccion,
    ]
  );

  return result.insertId;
};

const UPDATABLE_COLUMNS = {
  nombre: "nombre",
  apellido: "apellido",
  tipo_documento: "tipo_documento",
  numero_documento: "numero_documento",
  email: "email",
  telefono: "telefono",
  direccion: "direccion",
  activo: "activo",
};

export const updateClientById = async (idCliente, changes) => {
  const fields = Object.keys(changes).filter(
    (key) => key in UPDATABLE_COLUMNS
  );

  if (fields.length === 0) return 0;

  const setClause = fields
    .map((key) => `${UPDATABLE_COLUMNS[key]} = ?`)
    .join(", ");

  const values = fields.map((key) => changes[key]);

  const [result] = await pool.query(
    `UPDATE clientes
     SET ${setClause}
     WHERE id_cliente = ?`,
    [...values, idCliente]
  );

  return result.affectedRows;
};