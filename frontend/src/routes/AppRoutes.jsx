import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import ProtectedRoute from "../components/ProtectedRoute";
import { ROLES } from "../utils/roles";

// Paginas placeholder, reemplazar cuando se armen los modulos reales (Sprint 2/3)
import AdminDashboard from "../pages/AdminDashboard";
import CajeroPOS from "../pages/CajeroPOS";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta publica */}
      <Route path="/login" element={<Login />} />

      {/* Inventario: admin y encargado */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ENCARGADO]} />}>
        <Route path="/admin" element={<Navigate to="/admin/productos" replace />} />
        <Route path="/admin/productos" element={<AdminDashboard />} />
      </Route>

      {/* POS: cualquier rol valido (admin, encargado y cajero) */}
      <Route element={<ProtectedRoute />}>
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