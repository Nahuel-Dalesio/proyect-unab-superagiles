import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import ProtectedRoute from "../components/ProtectedRoute";

// Paginas placeholder, reemplazar cuando se armen los modulos reales (Sprint 2/3)
import AdminDashboard from "../pages/AdminDashboard";
import CajeroPOS from "../pages/CajeroPOS";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta publica */}
      <Route path="/login" element={<Login />} />

      {/* /admin a secas apunta al dashboard (asi el cajero pasa por ProtectedRoute) */}
      <Route path="/admin" element={<Navigate to="/admin/productos" replace />} />

      {/* Rutas protegidas para Administrador */}
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/admin/productos" element={<AdminDashboard />} />
      </Route>

      {/* Rutas protegidas para Cajero */}
      <Route element={<ProtectedRoute requiredRole="cajero" />}>
        <Route path="/" element={<CajeroPOS />} />
      </Route>

      {/* URL inexistente: sin sesion va a /login, con sesion muestra 404 */}
      <Route element={<ProtectedRoute />}>
        <Route path="*" element={<div>Página no encontrada</div>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;