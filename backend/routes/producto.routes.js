import { Router } from "express";
import { createProduct } from "../controllers/producto.controller.js";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/productos", verifyToken, authorizeRoles("admin", "encargado"), createProduct);

export default router;