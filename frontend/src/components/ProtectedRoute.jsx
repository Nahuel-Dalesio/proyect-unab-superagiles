import React, { useContext, useEffect, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { showUnauthorized } from "../utils/alerts";

// Dado el rol del usuario, devuelve su ruta "home" correspondiente
const getHomeByRole = (rol) => {
  if (rol === "admin") return "/admin/productos";
  if (rol === "cajero") return "/";
  return "/login";
};

// Redirige y muestra el aviso una sola vez (el ref evita el doble disparo de StrictMode)
const UnauthorizedRedirect = ({ to }) => {
  const alerted = useRef(false);

  useEffect(() => {
    if (alerted.current) return;
    alerted.current = true;
    showUnauthorized();
  }, []);

  return <Navigate to={to} replace />;
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
    return <UnauthorizedRedirect to={getHomeByRole(user.rol)} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;