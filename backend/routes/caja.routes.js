import { Router } from "express";
import {
  getCajaAbierta,
  abrirCaja,
  cerrarCaja,
} from "../controllers/caja.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Todos los roles autenticados pueden operar la caja.
router.get("/caja/abierta", verifyToken, getCajaAbierta);
router.post("/caja/apertura", verifyToken, abrirCaja);
router.post("/caja/cierre", verifyToken, cerrarCaja);

export default router;
