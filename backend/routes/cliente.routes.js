import { Router } from "express";
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deactivateClient,
} from "../controllers/cliente.controller.js";
import {
  verifyToken,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = Router();

// Admin y cajero pueden buscar clientes durante una venta.
router.get(
  "/clientes",
  verifyToken,
  authorizeRoles("admin", "cajero"),
  getClients
);

router.get(
  "/clientes/:id",
  verifyToken,
  authorizeRoles("admin", "cajero"),
  getClient
);

// El cajero también puede hacer el alta rápida de un cliente.
router.post(
  "/clientes",
  verifyToken,
  authorizeRoles("admin", "cajero"),
  createClient
);

// La administración completa queda reservada al admin.
router.put(
  "/clientes/:id",
  verifyToken,
  authorizeRoles("admin"),
  updateClient
);

router.delete(
  "/clientes/:id",
  verifyToken,
  authorizeRoles("admin"),
  deactivateClient
);

export default router;