import pool from "../bd/conexion.js";

const SELECT_VENTA = `
  SELECT
    v.id_venta AS idVenta,
    v.fecha_hora AS fechaHora,
    v.idUsuario,
    u.username,
    v.id_cliente AS idCliente,
    v.medio_pago AS medioPago,
    v.total,
    v.estado,
    v.estado_pago AS estadoPago
  FROM ventas v
  JOIN usuario u ON u.idUsuario = v.idUsuario
`;

export const findVentaById = async (idVenta) => {
  const [rows] = await pool.query(`${SELECT_VENTA} WHERE v.id_venta = ?`, [
    idVenta,
  ]);
  return rows[0];
};

export const findVentas = async ({ desde, hasta, idUsuario } = {}) => {
  const conditions = [];
  const params = [];

  if (desde) {
    conditions.push("v.fecha_hora >= ?");
    params.push(desde);
  }

  if (hasta) {
    conditions.push("v.fecha_hora <= ?");
    params.push(hasta);
  }

  if (idUsuario) {
    conditions.push("v.idUsuario = ?");
    params.push(idUsuario);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await pool.query(
    `${SELECT_VENTA} ${whereClause} ORDER BY v.fecha_hora DESC, v.id_venta DESC`,
    params
  );

  return rows;
};

export const findDetalleVenta = async (idVenta) => {
  const [rows] = await pool.query(
    `SELECT
      d.id_detalle AS idDetalle,
      d.id_venta AS idVenta,
      d.id_producto AS idProducto,
      p.nombre AS productoNombre,
      p.codigo_barras AS codigoBarras,
      d.cantidad,
      d.precio_unitario AS precioUnitario,
      d.subtotal
     FROM detalle_venta d
     JOIN productos p ON p.id_producto = d.id_producto
     WHERE d.id_venta = ?
     ORDER BY d.id_detalle ASC`,
    [idVenta]
  );

  return rows;
};

export const createVentaWithDetails = async (ventaData, detalles) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Verificar y bloquear productos
    const productIds = detalles.map((d) => d.idProducto);
    const placeholders = productIds.map(() => "?").join(",");
    const [productos] = await connection.query(
      `SELECT id_producto AS idProducto, nombre, stock, activo, precio_venta AS precioVenta
       FROM productos
       WHERE id_producto IN (${placeholders})
       FOR UPDATE`,
      productIds
    );

    const productoMap = new Map(productos.map((p) => [p.idProducto, p]));

    // Validar que todos existan y estén activos y tengan stock
    for (const detalle of detalles) {
      const producto = productoMap.get(detalle.idProducto);

      if (!producto) {
        throw new Error("PRODUCTO_NO_ENCONTRADO");
      }

      if (!producto.activo) {
        throw new Error("PRODUCTO_INACTIVO");
      }

      if (producto.stock < detalle.cantidad) {
        throw new Error("STOCK_INSUFICIENTE");
      }
    }

    // Calcular total con precios vigentes en BD
    let total = 0;
    for (const detalle of detalles) {
      const producto = productoMap.get(detalle.idProducto);
      total += Number(producto.precioVenta) * detalle.cantidad;
    }
    total = Math.round(total * 100) / 100;
        let estadoPago = "pagada";

    if (ventaData.medioPago === "cuenta_corriente") {
      if (!ventaData.idCliente) {
        throw new Error("CLIENTE_REQUERIDO");
      }

      const [clientes] = await connection.query(
        `SELECT
          activo,
          cuenta_corriente_habilitada AS cuentaCorrienteHabilitada,
          limite_credito AS limiteCredito,
          deuda_actual AS deudaActual
         FROM clientes
         WHERE id_cliente = ?
         FOR UPDATE`,
        [ventaData.idCliente]
      );

      if (clientes.length === 0) {
        throw new Error("CLIENTE_NO_ENCONTRADO");
      }

      const cliente = clientes[0];

      if (!cliente.activo) {
        throw new Error("CLIENTE_INACTIVO");
      }

      if (!cliente.cuentaCorrienteHabilitada) {
        throw new Error("CUENTA_CORRIENTE_NO_HABILITADA");
      }

      const nuevaDeuda =
        Math.round(
          (Number(cliente.deudaActual) + total) * 100
        ) / 100;

      if (nuevaDeuda > Number(cliente.limiteCredito)) {
        throw new Error("LIMITE_CREDITO_SUPERADO");
      }

      await connection.query(
        `UPDATE clientes
         SET deuda_actual = ?
         WHERE id_cliente = ?`,
        [nuevaDeuda, ventaData.idCliente]
      );

      estadoPago = "pendiente";
    }

    const [ventaResult] = await connection.query(
      `INSERT INTO ventas
        (idUsuario, id_cliente, medio_pago, total, estado, estado_pago)
       VALUES (?, ?, ?, ?, 'completada', ?)`,
      [
        ventaData.idUsuario,
        ventaData.idCliente ?? null,
        ventaData.medioPago,
        total,
        estadoPago,
      ]
    );

    const idVenta = ventaResult.insertId;

    // Insertar detalles y actualizar stock
    for (const detalle of detalles) {
      const producto = productoMap.get(detalle.idProducto);
      const precioUnitario = Number(producto.precioVenta);
      const subtotal = Math.round(precioUnitario * detalle.cantidad * 100) / 100;

      await connection.query(
        `INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [
          idVenta,
          detalle.idProducto,
          detalle.cantidad,
          precioUnitario,
          subtotal,
        ]
      );

      await connection.query(
        `UPDATE productos SET stock = stock - ? WHERE id_producto = ?`,
        [detalle.cantidad, detalle.idProducto]
      );
    }

    await connection.commit();

    return idVenta;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const anularVentaWithDetails = async (idVenta) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [ventas] = await connection.query(
      `SELECT
        id_venta AS idVenta,
        id_cliente AS idCliente,
        medio_pago AS medioPago,
        total,
        estado,
        estado_pago AS estadoPago
       FROM ventas
       WHERE id_venta = ?
       FOR UPDATE`,
      [idVenta]
    );

    if (ventas.length === 0) {
      throw new Error("VENTA_NO_ENCONTRADA");
    }

    const venta = ventas[0];

    if (venta.estado === "anulada") {
      throw new Error("VENTA_YA_ANULADA");
    }

        if (
      venta.medioPago === "cuenta_corriente" &&
      venta.estadoPago === "pendiente" &&
      venta.idCliente
    ) {
      const [clientes] = await connection.query(
        `SELECT deuda_actual AS deudaActual
         FROM clientes
         WHERE id_cliente = ?
         FOR UPDATE`,
        [venta.idCliente]
      );

      if (clientes.length === 0) {
        throw new Error("CLIENTE_NO_ENCONTRADO");
      }

      const nuevaDeuda = Math.max(
        0,
        Math.round(
          (Number(clientes[0].deudaActual) -
            Number(venta.total)) *
            100
        ) / 100
      );

      await connection.query(
        `UPDATE clientes
         SET deuda_actual = ?
         WHERE id_cliente = ?`,
        [nuevaDeuda, venta.idCliente]
      );
    }

    const [detalles] = await connection.query(
      `SELECT id_producto AS idProducto, cantidad
       FROM detalle_venta
       WHERE id_venta = ?`,
      [idVenta]
    );

    // Restaurar stock
    for (const detalle of detalles) {
      await connection.query(
        `UPDATE productos SET stock = stock + ? WHERE id_producto = ?`,
        [detalle.cantidad, detalle.idProducto]
      );
    }

    await connection.query(
      `UPDATE ventas
 SET estado = 'anulada',
     estado_pago = 'cancelada'
 WHERE id_venta = ?`,
      [idVenta]
    );

    await connection.commit();

    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
