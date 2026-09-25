import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// Dado el rol del usuario, devuelve su ruta "home" correspondiente
const getHomeByRole = (rol) => {
  if (rol === "admin") return "/admin/productos";
  if (rol === "cajero") return "/";
  return "/login";
};

const ProtectedRoute = ({ requiredRole }) => {
  const { user, token, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Cargando sesión...</div>;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.rol !== requiredRole) {
    return <Navigate to={getHomeByRole(user.rol)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;