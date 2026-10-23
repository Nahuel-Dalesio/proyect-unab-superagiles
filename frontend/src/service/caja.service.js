import { apiRequest } from "./api";

// GET /api/caja/abierta
// Devuelve { caja, esPropietario }. caja es null si no hay ninguna abierta.
export const getCajaAbierta = () => apiRequest("/api/caja/abierta");

// POST /api/caja/apertura
// Devuelve { message, caja }. Todos los roles pueden abrir.
export const abrirCaja = (montoInicial) =>
  apiRequest("/api/caja/apertura", {
    method: "POST",
    body: { montoInicial },
  });

// POST /api/caja/cierre
// Solo el usuario que abrió la caja puede cerrarla.
export const cerrarCaja = (idCierre, montoFinal) =>
  apiRequest("/api/caja/cierre", {
    method: "POST",
    body: { idCierre, montoFinal },
  });
