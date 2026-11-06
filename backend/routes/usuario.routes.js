import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
} from "../controllers/usuario.controller.js";
import {
  verifyToken,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.get(
  "/usuarios",
  verifyToken,
  authorizeRoles("admin"),
  getUsers
);

router.get(
  "/usuarios/:id",
  verifyToken,
  authorizeRoles("admin"),
  getUserById
);

router.post(
  "/usuarios",
  verifyToken,
  authorizeRoles("admin"),
  createUser
);

router.put(
  "/usuarios/:id",
  verifyToken,
  authorizeRoles("admin"),
  updateUser
);

router.delete(
  "/usuarios/:id",
  verifyToken,
  authorizeRoles("admin"),
  deactivateUser
);

export default router;