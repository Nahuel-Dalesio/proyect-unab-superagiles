// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middlewares base ---
app.use(cors()); // habilita requests desde el frontend (Vite corre en otro puerto)
app.use(express.json()); // permite leer JSON en el body de los requests

// --- Rutas ---
app.use("/api", authRoutes);

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