import { Router } from "express";
import {
  createVenta,
  getVentas,
  getVentaById,
  cancelarVenta,
} from "../controllers/ventas.controller.js";
import {
  verifyToken,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = Router();

// Todas las rutas requieren autenticación.
// El cajero/encargado/admin pueden registrar y consultar ventas.
// La anulación requiere mayor privilegio (admin/encargado) por defecto.
router.post("/ventas", verifyToken, createVenta);
router.get("/ventas", verifyToken, getVentas);
router.get("/ventas/:id", verifyToken, getVentaById);
router.put("/ventas/:id/anular", verifyToken, authorizeRoles("admin", "encargado"), cancelarVenta);

export default router;
