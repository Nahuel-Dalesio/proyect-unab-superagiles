import { Router } from "express";
import {
  createProduct,
  getProducts,
  getLowStockProducts,
  updatePricesByPercentage,
  updateProduct,
} from "../controllers/producto.controller.js";
import {
  verifyToken,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/productos", verifyToken, getProducts);

router.get(
  "/productos/stock-bajo",
  verifyToken,
  authorizeRoles("admin", "encargado"),
  getLowStockProducts
);

router.post(
  "/productos",
  verifyToken,
  authorizeRoles("admin", "encargado"),
  createProduct
);

router.put(
  "/productos/precios/porcentaje",
  verifyToken,
  authorizeRoles("admin", "encargado"),
  updatePricesByPercentage
);

router.put(
  "/productos/:id",
  verifyToken,
  authorizeRoles("admin", "encargado"),
  updateProduct
);

export default router;