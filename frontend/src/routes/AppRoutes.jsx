import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import Caja from "../pages/Caja/Caja";
import LoginForm from "@/components/LoginForm";
import Productos from "@/pages/Productos/Productos";
import Clientes from "@/pages/Clientes/Clientes";
import Usuarios from "@/pages/Usuarios/Usuarios";
import Ventas from "@/pages/Ventas/Ventas";
import CierresCaja from "@/pages/CierresCaja/CierresCaja";
import { ROLES } from "@/utils/roles";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Única ruta pública */}
      <Route path="/login" element={<LoginForm />} />

      {/* Rutas protegidas: requieren sesión iniciada */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/caja" replace />} />
          <Route path="/caja" element={<Caja />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/clientes" element={<Clientes />} />

          {/* Administradores y encargados pueden acceder a inventario y cierres de caja */}
          <Route
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ENCARGADO]} />
            }
          >
            <Route path="/inventario" element={<Productos />} />
            <Route path="/cierres-caja" element={<CierresCaja />} />
          </Route>

          {/* Solo administradores pueden gestionar usuarios */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/usuarios" element={<Usuarios />} />
          </Route>

          <Route path="*" element={<Navigate to="/caja" replace />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
