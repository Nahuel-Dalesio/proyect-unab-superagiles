import { Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login/Login";
import ProtectedRoute from "../components/ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import Caja from "../pages/Caja/Caja";
import Productos from "../pages/Productos/Productos";
import LoginForm from "@/components/LoginForm";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta publica */}
      <Route path="/login" element={<Login />} />
      <Route path="/test" element={<LoginForm />} />

      {/* Rutas con sesion: cualquier rol valido, todas dentro del layout compartido.
          Las acciones de gestion se ocultan al cajero dentro de cada pantalla. */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* "Inicio" no existe por ahora: la raiz redirige a Caja */}
          <Route path="/" element={<Navigate to="/caja" replace />} />
          <Route path="/caja" element={<Caja />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="*" element={<div>Página no encontrada</div>} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;