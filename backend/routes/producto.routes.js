import { Router } from "express";
import {
  createProduct,
  getProducts,
} from "../controllers/producto.controller.js";

// Solo importamos verifyToken de auth
import { verifyToken } from "../middlewares/auth.middleware.js";
// Importamos TU middleware nuevo
import { checkRole } from "../middlewares/rol.middleware.js"; 

const router = Router();

// Ruta pública (solo requiere estar logueado con verifyToken)
router.get("/productos", verifyToken, getProducts);

// Ruta sensible (requiere estar logueado Y ser admin)
router.post(
  "/productos",
  verifyToken,
  checkRole("admin"), // Acá aplicamos tu función
  createProduct
);

export default router;