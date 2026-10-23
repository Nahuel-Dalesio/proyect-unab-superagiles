import pool from "../bd/conexion.js";

// Datos de la caja + username del usuario que la abrió.
const SELECT_CAJA = `
  SELECT
    c.id_cierre AS idCierre,
    c.idUsuario,
    u.username,
    c.fecha_apertura AS fechaApertura,
    c.fecha_cierre AS fechaCierre,
    c.monto_inicial AS montoInicial,
    c.monto_final AS montoFinal,
    c.total_ventas AS totalVentas,
    c.diferencia,
    c.estado
  FROM cierres_caja c
  JOIN usuario u ON u.idUsuario = c.idUsuario
`;

// La caja es única en todo el sistema: como máximo hay una abierta.
export const findOpenCaja = async () => {
  const [rows] = await pool.query(
    `${SELECT_CAJA} WHERE c.estado = 'abierta' LIMIT 1`
  );

  return rows[0];
};

export const findCajaById = async (idCierre) => {
  const [rows] = await pool.query(`${SELECT_CAJA} WHERE c.id_cierre = ?`, [
    idCierre,
  ]);

  return rows[0];
};

export const createApertura = async ({ idUsuario, montoInicial }) => {
  const [result] = await pool.query(
    `INSERT INTO cierres_caja (idUsuario, fecha_apertura, monto_inicial, estado)
     VALUES (?, NOW(), ?, 'abierta')`,
    [idUsuario, montoInicial]
  );

  return result.insertId;
};

// Total vendido desde la apertura de la caja indicada.
// Se compara contra la fecha guardada en la propia caja para evitar
// problemas de zona horaria al serializar fechas desde JS.
export const getTotalVentasDesde = async (idCierre) => {
  const [rows] = await pool.query(
    `SELECT COALESCE(SUM(v.total), 0) AS total
     FROM ventas v
     JOIN cierres_caja c ON c.id_cierre = ?
     WHERE v.estado = 'completada'
       AND v.fecha_hora >= c.fecha_apertura`,
    [idCierre]
  );

  return Number(rows[0].total);
};

export const closeCaja = async ({
  idCierre,
  montoFinal,
  totalVentas,
  diferencia,
}) => {
  const [result] = await pool.query(
    `UPDATE cierres_caja
     SET fecha_cierre = NOW(),
         monto_final = ?,
         total_ventas = ?,
         diferencia = ?,
         estado = 'cerrada'
     WHERE id_cierre = ? AND estado = 'abierta'`,
    [montoFinal, totalVentas, diferencia, idCierre]
  );

  return result.affectedRows;
};
