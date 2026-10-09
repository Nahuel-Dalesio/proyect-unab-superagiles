import { Router } from "express";
import {
  createProduct,
  getProducts,
  updateProduct,
} from "../controllers/producto.controller.js";
import {
  verifyToken,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/productos", verifyToken, getProducts);

router.post(
  "/productos",
  verifyToken,
  authorizeRoles("admin", "encargado"),
  createProduct
);

router.put(
  "/productos/:id",
  verifyToken,
  authorizeRoles("admin", "encargado"),
  updateProduct
);

export default router;