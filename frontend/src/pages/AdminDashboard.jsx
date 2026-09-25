import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Panel de Administración</h1>
      <p>Bienvenido, {user?.username} (rol: {user?.rol})</p>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
};

export default AdminDashboard;
