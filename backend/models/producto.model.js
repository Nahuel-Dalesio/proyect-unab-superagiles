import pool from "../bd/conexion.js";

export const findProductByBarcode = async (codigoBarras) => {
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