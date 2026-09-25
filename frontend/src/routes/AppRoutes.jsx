import { Routes, Route } from "react-router-dom";
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

      {/* Rutas protegidas para Administrador */}
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/admin/productos" element={<AdminDashboard />} />
      </Route>

      {/* Rutas protegidas para Cajero */}
      <Route element={<ProtectedRoute requiredRole="cajero" />}>
        <Route path="/" element={<CajeroPOS />} />
      </Route>

      {/* TEMPORAL - solo para diagnostico, borrar despues */}
      <Route path="*" element={<div>NO MATCHEO NINGUNA RUTA</div>} />
    </Routes>
  );
};

export default AppRoutes;