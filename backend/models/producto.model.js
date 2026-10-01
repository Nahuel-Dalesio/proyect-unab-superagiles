import pool from "../bd/conexion.js";

export const findProductByBarcode = async (codigoBarras) => {
  const [rows] = await pool.query(
    "SELECT * FROM productos WHERE codigo_barras = ?",
    [codigoBarras]
  );

  return rows[0];
};

export const createProduct = async ({
  codigoBarras,
  nombre,
  precioCosto,
  precioVenta,
  stock,
}) => {
  const [result] = await pool.query(
    `INSERT INTO productos
      (codigo_barras, nombre, precio_costo, precio_venta, stock)
     VALUES (?, ?, ?, ?, ?)`,
    [codigoBarras, nombre, precioCosto, precioVenta, stock]
  );

  return result.insertId;
};