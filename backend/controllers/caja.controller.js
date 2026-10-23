import {
  abrirCaja as abrirCajaData,
  cerrarCaja as cerrarCajaData,
  obtenerCajaAbierta,
  CajaError,
} from "../service/caja.service.js";

const CAJA_ERROR_STATUS = {
  MISSING_FIELDS: 400,
  INVALID_VALUES: 400,
  INVALID_ID: 400,
  CAJA_YA_ABIERTA: 409,
  CAJA_YA_CERRADA: 409,
  CAJA_NOT_FOUND: 404,
  NOT_OWNER: 403,
};

export const getCajaAbierta = async (req, res) => {
  try {
    const caja = await obtenerCajaAbierta();

    return res.status(200).json({
      caja,
      esPropietario: caja ? caja.idUsuario === req.user.id : false,
    });
  } catch (error) {
    console.error("Error al obtener la caja abierta:", error);

    return res.status(500).json({
      message: "Error interno al obtener la caja abierta",
    });
  }
};

export const abrirCaja = async (req, res) => {
  try {
    const caja = await abrirCajaData(req.user.id, req.body.montoInicial);

    return res.status(201).json({
      message: "Caja abierta correctamente",
      caja,
    });
  } catch (error) {
    if (error instanceof CajaError) {
      return res
        .status(CAJA_ERROR_STATUS[error.code] ?? 400)
        .json({ message: error.message });
    }

    console.error("Error al abrir la caja:", error);

    return res.status(500).json({
      message: "Error interno al abrir la caja",
    });
  }
};

export const cerrarCaja = async (req, res) => {
  try {
    const caja = await cerrarCajaData(
      req.user.id,
      req.body.idCierre,
      req.body.montoFinal
    );

    return res.status(200).json({
      message: "Caja cerrada correctamente",
      caja,
    });
  } catch (error) {
    if (error instanceof CajaError) {
      return res
        .status(CAJA_ERROR_STATUS[error.code] ?? 400)
        .json({ message: error.message });
    }

    console.error("Error al cerrar la caja:", error);

    return res.status(500).json({
      message: "Error interno al cerrar la caja",
    });
  }
};
