import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import Caja from "../pages/Caja/Caja";
import LoginForm from "@/components/LoginForm";
import ProductosTest from "@/pages/Test/ProductosTest";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<LoginForm />} />

      {/* Rutas protegidas: requieren sesión iniciada */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/caja" replace />} />
          <Route path="/caja" element={<Caja />} />
          <Route path="/inventario" element={<ProductosTest />} />
          <Route path="*" element={<div>Página no encontrada</div>} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;