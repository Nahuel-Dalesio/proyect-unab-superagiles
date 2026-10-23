import {
  createVentaWithDetails,
  findVentaById,
  findVentas,
  findDetalleVenta,
  anularVentaWithDetails,
} from "../models/ventas.model.js";

export class VentaError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "VentaError";
    this.code = code;
  }
}

// Límites según esquema
const MAX_PRECIO = 99999999.99;
const MAX_CANTIDAD = 2147483647;
const MEDIOS_PAGO_VALIDOS = ["efectivo", "debito", "credito", "transferencia", "qr"];

const parseNumber = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return NaN;
};

const isValidPrice = (n) =>
  Number.isFinite(n) && n >= 0 && n <= MAX_PRECIO && Number(n.toFixed(2)) === n;

const isValidCantidad = (n) =>
  Number.isInteger(n) && n > 0 && n <= MAX_CANTIDAD;

const round2 = (n) => Math.round(n * 100) / 100;

const mapVenta = (venta) => {
  if (!venta) return null;

  return {
    ...venta,
    total: Number(venta.total),
  };
};

const mapDetalle = (detalle) => ({
  ...detalle,
  cantidad: Number(detalle.cantidad),
  precioUnitario: Number(detalle.precioUnitario),
  subtotal: Number(detalle.subtotal),
});

export const registrarVenta = async (idUsuario, data) => {
  if (!idUsuario) {
    throw new VentaError("INVALID_ID", "El usuario no es válido");
  }

  const { items, medioPago, idCliente } = data || {};

  if (!Array.isArray(items) || items.length === 0) {
    throw new VentaError("MISSING_FIELDS", "La venta debe tener al menos un producto");
  }

  if (!MEDIOS_PAGO_VALIDOS.includes(medioPago)) {
    throw new VentaError(
      "INVALID_VALUES",
      "El medio de pago debe ser uno de: efectivo, debito, credito, transferencia, qr"
    );
  }

  const detalles = [];
  let total = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const idProducto = parseNumber(item.idProducto ?? item.id_producto);
    const cantidad = parseNumber(item.cantidad);

    if (!Number.isInteger(idProducto) || idProducto <= 0) {
      throw new VentaError("INVALID_VALUES", "idProducto inválido en los items");
    }

    if (!isValidCantidad(cantidad)) {
      throw new VentaError(
        "INVALID_VALUES",
        "La cantidad debe ser un entero mayor a 0"
      );
    }

    detalles.push({
      idProducto,
      cantidad,
    });
  }

  let idVenta;

  try {
    idVenta = await createVentaWithDetails(
      {
        idUsuario,
        idCliente: idCliente ?? null,
        medioPago,
        total,
      },
      detalles
    );
  } catch (error) {
    if (error.message === "PRODUCTO_NO_ENCONTRADO") {
      throw new VentaError("PRODUCT_NOT_FOUND", "Uno o más productos no existen");
    }

    if (error.message === "PRODUCTO_INACTIVO") {
      throw new VentaError("PRODUCT_INACTIVE", "Uno o más productos no están activos");
    }

    if (error.message === "STOCK_INSUFICIENTE") {
      throw new VentaError("STOCK_INSUFICIENTE", "Stock insuficiente para completar la venta");
    }

    throw error;
  }

  const venta = await findVentaById(idVenta);
  const detalle = await findDetalleVenta(idVenta);

  return {
    ...mapVenta(venta),
    detalles: detalle.map(mapDetalle),
  };
};

export const obtenerVenta = async (idVenta) => {
  const id = parseNumber(idVenta);

  if (!Number.isInteger(id) || id <= 0) {
    throw new VentaError("INVALID_ID", "El ID de la venta no es válido");
  }

  const venta = await findVentaById(id);

  if (!venta) {
    throw new VentaError("VENTA_NOT_FOUND", "Venta no encontrada");
  }

  const detalle = await findDetalleVenta(id);

  return {
    ...mapVenta(venta),
    detalles: detalle.map(mapDetalle),
  };
};

export const listarVentas = async (filtros = {}) => {
  const ventas = await findVentas(filtros);

  const ventasConDetalle = await Promise.all(
    ventas.map(async (venta) => {
      const detalle = await findDetalleVenta(venta.idVenta);
      return {
        ...mapVenta(venta),
        detalles: detalle.map(mapDetalle),
      };
    })
  );

  return ventasConDetalle;
};

export const anularVenta = async (idVenta) => {
  const id = parseNumber(idVenta);

  if (!Number.isInteger(id) || id <= 0) {
    throw new VentaError("INVALID_ID", "El ID de la venta no es válido");
  }

  try {
    await anularVentaWithDetails(id);
  } catch (error) {
    if (error.message === "VENTA_NO_ENCONTRADA") {
      throw new VentaError("VENTA_NOT_FOUND", "Venta no encontrada");
    }

    if (error.message === "VENTA_YA_ANULADA") {
      throw new VentaError("VENTA_YA_ANULADA", "La venta ya se encuentra anulada");
    }

    throw error;
  }

  return obtenerVenta(id);
};
