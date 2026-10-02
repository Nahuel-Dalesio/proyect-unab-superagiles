import React, { useContext, useEffect, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { showUnauthorized } from "../utils/alerts";
import { ROLES } from "../utils/roles";

const UnauthorizedRedirect = ({ to }) => {
  const alerted = useRef(false);

  useEffect(() => {
    if (alerted.current) return;
    alerted.current = true;
    showUnauthorized();
  }, []);

  return <Navigate to={to} replace />;
};

// allowedRoles: lista de roles con acceso. Si se omite, basta con estar logueado.
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, token, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Cargando sesión...</div>;
  }

  if (!token || !user || !Object.values(ROLES).includes(user.rol)) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <UnauthorizedRedirect to="/" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;