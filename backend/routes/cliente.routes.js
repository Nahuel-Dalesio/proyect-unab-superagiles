import { Router } from "express";
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deactivateClient,
  configureCurrentAccount,
} from "../controllers/cliente.controller.js";
import {
  verifyToken,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = Router();

// Todos los roles autenticados pueden buscar clientes y consultar uno por ID.
router.get(
  "/clientes",
  verifyToken,
  authorizeRoles("admin", "encargado", "cajero"),
  getClients
);

router.get(
  "/clientes/:id",
  verifyToken,
  authorizeRoles("admin", "encargado", "cajero"),
  getClient
);

// Todos los roles pueden hacer el alta de un cliente (inclusive desde Caja).
router.post(
  "/clientes",
  verifyToken,
  authorizeRoles("admin", "encargado", "cajero"),
  createClient
);

// La edición y baja lógica queda reservada a admin y encargado.
router.put(
  "/clientes/:id",
  verifyToken,
  authorizeRoles("admin", "encargado"),
  updateClient
);

// Admin y encargado pueden habilitar la cuenta corriente y establecer el límite de crédito.
router.patch(
  "/clientes/:id/cuenta-corriente",
  verifyToken,
  authorizeRoles("admin", "encargado"),
  configureCurrentAccount
);

router.delete(
  "/clientes/:id",
  verifyToken,
  authorizeRoles("admin", "encargado"),
  deactivateClient
);

export default router;
