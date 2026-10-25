// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/producto.routes.js";
import cajaRoutes from "./routes/caja.routes.js";
import ventasRoutes from "./routes/ventas.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middlewares base ---
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
); // permite requests solo desde el origen configurado

app.use(express.json()); // permite leer JSON en el body de los requests

// --- Rutas ---
app.use("/api", authRoutes);
app.use("/api", productRoutes);
app.use("/api", cajaRoutes);
app.use("/api", ventasRoutes);

// Ruta de prueba simple para verificar que el server esta vivo
app.get("/", (req, res) => {
  res.json({ message: "API del Sistema Kiosco funcionando correctamente" });
});

// --- Manejo de rutas no encontradas ---
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});