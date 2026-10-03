import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import ProtectedRoute from "../components/ProtectedRoute";

// Paginas placeholder, reemplazar cuando se armen los modulos reales (Sprint 2/3)
import Productos from "../pages/Productos";


const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta publica */}
      <Route path="/login" element={<Login />} />

      {/* POS y Productos: cualquier rol valido (admin, encargado y cajero).
          Las acciones de gestion se ocultan al cajero dentro de la pantalla. */}
      <Route element={<ProtectedRoute />}>
        
        <Route path="/productos" element={<Productos />} />
      </Route>

      {/* URL inexistente: sin sesion va a /login, con sesion muestra 404 */}
      <Route element={<ProtectedRoute />}>
        <Route path="*" element={<div>Página no encontrada</div>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;