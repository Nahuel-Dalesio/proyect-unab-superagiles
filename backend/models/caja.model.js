import pool from "../bd/conexion.js";

// Datos de la caja + username del usuario que la abrió.
const SELECT_CAJA = `
  SELECT
    c.id_cierre AS idCierre,
    c.idUsuario,
    u.username,
    u.rol,
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

export const findAllCierresCaja = async () => {
  const [rows] = await pool.query(
    `${SELECT_CAJA} ORDER BY c.fecha_apertura DESC, c.id_cierre DESC`
  );

  return rows;
};

export const createApertura = async ({ idUsuario, montoInicial }) => {
  const [result] = await pool.query(
    `INSERT INTO cierres_caja (idUsuario, fecha_apertura, monto_inicial, estado)
     VALUES (?, NOW(), ?, 'abierta')`,
    [idUsuario, montoInicial]
  );

  return result.insertId;
};

// Desglose de ventas por medio de pago desde la apertura de la caja indicada.
// Se compara contra la fecha guardada en la propia caja para evitar
// problemas de zona horaria al serializar fechas desde JS.
export const getResumenVentasDesde = async (idCierre) => {
  const [rows] = await pool.query(
    `SELECT
       v.medio_pago AS medioPago,
       COUNT(v.id_venta) AS cantidad,
       COALESCE(SUM(v.total), 0) AS subtotal
     FROM ventas v
     JOIN cierres_caja c ON c.id_cierre = ?
     WHERE v.estado = 'completada'
       AND v.fecha_hora >= c.fecha_apertura
       AND (c.fecha_cierre IS NULL OR v.fecha_hora <= c.fecha_cierre)
     GROUP BY v.medio_pago`,
    [idCierre]
  );

  const desglose = {
    efectivo: 0,
    transferencia: 0,
    debito: 0,
    credito: 0,
    qr: 0,
  };

  let cantidadOperaciones = 0;

  for (const row of rows) {
    const medio = row.medioPago;
    const monto = Number(row.subtotal) || 0;
    const cant = Number(row.cantidad) || 0;
    cantidadOperaciones += cant;
    if (medio in desglose) {
      desglose[medio] = monto;
    }
  }

  const ventasEfectivo = Math.round(desglose.efectivo * 100) / 100;
  const ventasTransferencia = Math.round(desglose.transferencia * 100) / 100;
  const ventasTarjeta =
    Math.round((desglose.debito + desglose.credito) * 100) / 100;
  const ventasOtros = Math.round(desglose.qr * 100) / 100;
  const totalVentas =
    Math.round(
      (ventasEfectivo + ventasTransferencia + ventasTarjeta + ventasOtros) * 100
    ) / 100;

  return {
    totalVentas,
    ventasEfectivo,
    ventasTransferencia,
    ventasTarjeta,
    cantidadOperaciones,
    desgloseMediosPago: desglose,
  };
};

// Mantiene compatibilidad si algún módulo pide solo el total general
export const getTotalVentasDesde = async (idCierre) => {
  const resumen = await getResumenVentasDesde(idCierre);
  return resumen.totalVentas;
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
