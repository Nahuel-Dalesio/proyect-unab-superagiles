import { Router } from "express";
import {
  getCajaAbierta,
  getCierresCaja,
  abrirCaja,
  cerrarCaja,
} from "../controllers/caja.controller.js";
import {
  verifyToken,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = Router();

// Todos los roles autenticados pueden operar la caja.
router.get("/caja/abierta", verifyToken, getCajaAbierta);
router.post("/caja/apertura", verifyToken, abrirCaja);
router.post("/caja/cierre", verifyToken, cerrarCaja);

// Solo administradores y encargados pueden consultar el historial de cierres de caja.
router.get(
  "/caja/cierres",
  verifyToken,
  authorizeRoles("admin", "encargado"),
  getCierresCaja
);

export default router;
