import {
  registrarVenta,
  obtenerVenta,
  listarVentas,
  anularVenta,
  VentaError,
} from "../service/ventas.service.js";

const VENTA_ERROR_STATUS = {
  MISSING_FIELDS: 400,
  INVALID_VALUES: 400,
  INVALID_ID: 400,
  VENTA_NOT_FOUND: 404,
  PRODUCT_NOT_FOUND: 404,
  PRODUCT_INACTIVE: 400,
  STOCK_INSUFICIENTE: 409,
  VENTA_YA_ANULADA: 409,
};

export const createVenta = async (req, res) => {
  try {
    const venta = await registrarVenta(req.user.id, req.body);

    return res.status(201).json({
      message: "Venta registrada correctamente",
      venta,
    });
  } catch (error) {
    if (error instanceof VentaError) {
      return res
        .status(VENTA_ERROR_STATUS[error.code] ?? 400)
        .json({ message: error.message });
    }

    console.error("Error al registrar venta:", error);

    return res.status(500).json({
      message: "Error interno al registrar la venta",
    });
  }
};

export const getVentas = async (req, res) => {
  try {
    const ventas = await listarVentas(req.query);

    return res.status(200).json(ventas);
  } catch (error) {
    console.error("Error al obtener ventas:", error);

    return res.status(500).json({
      message: "Error interno al obtener las ventas",
    });
  }
};

export const getVentaById = async (req, res) => {
  try {
    const venta = await obtenerVenta(req.params.id);

    return res.status(200).json(venta);
  } catch (error) {
    if (error instanceof VentaError) {
      return res
        .status(VENTA_ERROR_STATUS[error.code] ?? 400)
        .json({ message: error.message });
    }

    console.error("Error al obtener la venta:", error);

    return res.status(500).json({
      message: "Error interno al obtener la venta",
    });
  }
};

export const cancelarVenta = async (req, res) => {
  try {
    const venta = await anularVenta(req.params.id);

    return res.status(200).json({
      message: "Venta anulada correctamente",
      venta,
    });
  } catch (error) {
    if (error instanceof VentaError) {
      return res
        .status(VENTA_ERROR_STATUS[error.code] ?? 400)
        .json({ message: error.message });
    }

    console.error("Error al anular la venta:", error);

    return res.status(500).json({
      message: "Error interno al anular la venta",
    });
  }
};
