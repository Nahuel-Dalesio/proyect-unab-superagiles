import { Router } from "express";
import { createProduct } from "../controllers/producto.controller.js";

const router = Router();

router.post("/productos", createProduct);

export default router;