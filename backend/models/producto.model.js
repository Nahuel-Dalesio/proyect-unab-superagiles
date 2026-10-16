import pool from "../bd/conexion.js";

export const findProductByBarcode = async (codigoBarras, excludeId = null) => {
  if (excludeId !== null) {
    const [rows] = await pool.query(
      "SELECT * FROM productos WHERE codigo_barras = ? AND id_producto <> ?",
      [codigoBarras, excludeId]
    );

    return rows[0];
  }

  const [rows] = await pool.query(
    "SELECT * FROM productos WHERE codigo_barras = ?",
    [codigoBarras]
  );

  return rows[0];
};

export const findProducts = async (search = "") => {
  const searchPattern = `%${search}%`;

  const [rows] = await pool.query(
    `SELECT
      id_producto AS idProducto,
      codigo_barras AS codigoBarras,
      nombre,
      descripcion,
      precio_costo AS precioCosto,
      precio_venta AS precioVenta,
      stock,
      stock_minimo AS stockMinimo,
      activo
    FROM productos
    WHERE activo = true
      AND (nombre LIKE ? OR codigo_barras LIKE ?)
    ORDER BY nombre ASC`,
    [searchPattern, searchPattern]
  );

  return rows;
};

export const findLowStockProducts = async () => {
  const [rows] = await pool.query(
    `SELECT
      id_producto AS idProducto,
      codigo_barras AS codigoBarras,
      nombre,
      descripcion,
      precio_costo AS precioCosto,
      precio_venta AS precioVenta,
      stock,
      stock_minimo AS stockMinimo,
      activo
    FROM productos
    WHERE activo = true
      AND stock <= stock_minimo
    ORDER BY stock ASC, nombre ASC`
  );

  return rows;
};

export const createProduct = async ({
  codigoBarras,
  nombre,
  descripcion,
  precioCosto,
  precioVenta,
  stock,
  stockMinimo,
}) => {
  const [result] = await pool.query(
    `INSERT INTO productos
      (codigo_barras, nombre, descripcion, precio_costo, precio_venta, stock, stock_minimo)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [codigoBarras, nombre, descripcion, precioCosto, precioVenta, stock, stockMinimo]
  );

  return result.insertId;
};

export const findProductById = async (idProducto) => {
  const [rows] = await pool.query(
    `SELECT
      id_producto AS idProducto,
      codigo_barras AS codigoBarras,
      nombre,
      descripcion,
      precio_costo AS precioCosto,
      precio_venta AS precioVenta,
      stock,
      stock_minimo AS stockMinimo,
      activo
    FROM productos
    WHERE id_producto = ?`,
    [idProducto]
  );

  return rows[0];
};

// Lista fija: campo del service -> columna de la tabla.
// Solo estas columnas se pueden actualizar.
const UPDATABLE_COLUMNS = {
  codigoBarras: "codigo_barras",
  nombre: "nombre",
  descripcion: "descripcion",
  precioCosto: "precio_costo",
  precioVenta: "precio_venta",
  stock: "stock",
  stockMinimo: "stock_minimo",

};

// Actualiza solo los campos que vengan en `changes`.
export const updateProductById = async (idProducto, changes) => {
  const fields = Object.keys(changes).filter((key) => key in UPDATABLE_COLUMNS);

  if (fields.length === 0) return 0;

  const setClause = fields.map((key) => `${UPDATABLE_COLUMNS[key]} = ?`).join(", ");
  const values = fields.map((key) => changes[key]);

  const [result] = await pool.query(
    `UPDATE productos SET ${setClause} WHERE id_producto = ?`,
    [...values, idProducto]
  );

  return result.affectedRows;
};

export const updateActiveProductPricesByPercentage = async (porcentaje) => {
  const [result] = await pool.query(
    `UPDATE productos
     SET precio_venta = ROUND(precio_venta * (1 + ? / 100), 2)
     WHERE activo = true`,
    [porcentaje]
  );

  return result.affectedRows;
};