import {
  findOpenCaja,
  findCajaById,
  createApertura,
  getTotalVentasDesde,
  closeCaja,
} from "../models/caja.model.js";

export class CajaError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "CajaError";
    this.code = code;
  }
}

// decimal(10,2)
const MAX_MONTO = 99999999.99;

// Solo acepta number o string numérico no vacío.
const parseNumber = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return NaN;
};

const isValidMonto = (n) =>
  Number.isFinite(n) && n >= 0 && n <= MAX_MONTO && Number(n.toFixed(2)) === n;

const isValidId = (n) => Number.isInteger(n) && n > 0;

const round2 = (n) => Math.round(n * 100) / 100;

// Normaliza los DECIMAL (MySQL los devuelve como string) a number.
const mapCaja = (caja) => {
  if (!caja) return null;

  return {
    ...caja,
    montoInicial: Number(caja.montoInicial),
    montoFinal: caja.montoFinal === null ? null : Number(caja.montoFinal),
    totalVentas: caja.totalVentas === null ? null : Number(caja.totalVentas),
    diferencia: caja.diferencia === null ? null : Number(caja.diferencia),
  };
};

// Devuelve la caja abierta (con el total vendido hasta ahora) o null.
export const obtenerCajaAbierta = async () => {
  const caja = await findOpenCaja();

  if (!caja) return null;

  const totalVentas = await getTotalVentasDesde(caja.idCierre);

  return mapCaja({ ...caja, totalVentas });
};

export const abrirCaja = async (idUsuario, montoInicialValue) => {
  if (!isValidId(idUsuario)) {
    throw new CajaError("INVALID_ID", "El usuario no es válido");
  }

  const montoInicial = parseNumber(montoInicialValue);

  if (!isValidMonto(montoInicial)) {
    throw new CajaError(
      "INVALID_VALUES",
      "El monto inicial debe ser un número válido, no negativo y con hasta 2 decimales"
    );
  }

  const cajaAbierta = await findOpenCaja();

  if (cajaAbierta) {
    throw new CajaError(
      "CAJA_YA_ABIERTA",
      "Ya hay una caja abierta. Cerrá la caja actual antes de abrir otra."
    );
  }

  let idCierre;

  try {
    idCierre = await createApertura({ idUsuario, montoInicial });
  } catch (error) {
    // La restricción uq_una_caja_abierta evita dos cajas abiertas a la vez.
    if (error?.code === "ER_DUP_ENTRY") {
      throw new CajaError(
        "CAJA_YA_ABIERTA",
        "Ya hay una caja abierta. Cerrá la caja actual antes de abrir otra."
      );
    }

    throw error;
  }

  const caja = await findCajaById(idCierre);

  return mapCaja({ ...caja, totalVentas: 0 });
};

export const cerrarCaja = async (idUsuario, idCierreValue, montoFinalValue) => {
  if (!isValidId(idUsuario)) {
    throw new CajaError("INVALID_ID", "El usuario no es válido");
  }

  const idCierre = parseNumber(idCierreValue);

  if (!isValidId(idCierre)) {
    throw new CajaError("INVALID_ID", "El ID de caja no es válido");
  }

  const montoFinal = parseNumber(montoFinalValue);

  if (!isValidMonto(montoFinal)) {
    throw new CajaError(
      "INVALID_VALUES",
      "El monto final debe ser un número válido, no negativo y con hasta 2 decimales"
    );
  }

  const caja = await findCajaById(idCierre);

  if (!caja) {
    throw new CajaError("CAJA_NOT_FOUND", "La caja no existe");
  }

  if (caja.estado !== "abierta") {
    throw new CajaError("CAJA_YA_CERRADA", "La caja ya está cerrada");
  }

  // Solo el usuario que abrió la caja puede cerrarla.
  if (caja.idUsuario !== idUsuario) {
    throw new CajaError(
      "NOT_OWNER",
      "La caja fue abierta por otro usuario y solo esa persona puede cerrarla"
    );
  }

  const totalVentas = await getTotalVentasDesde(idCierre);
  const montoEsperado = round2(Number(caja.montoInicial) + totalVentas);
  const diferencia = round2(montoFinal - montoEsperado);

  const affectedRows = await closeCaja({
    idCierre,
    montoFinal,
    totalVentas,
    diferencia,
  });

  if (affectedRows === 0) {
    throw new CajaError("CAJA_YA_CERRADA", "La caja ya está cerrada");
  }

  const cajaCerrada = await findCajaById(idCierre);

  return mapCaja(cajaCerrada);
};
