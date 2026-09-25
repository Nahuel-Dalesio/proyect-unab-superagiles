import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <main className="admin-dashboard">
      <div className="admin-content">
        <h1>Panel de Administración</h1>

        <p>
          Bienvenido, {user?.username} (rol: {user?.rol})
        </p>

        <button
          type="button"
          className="admin-logout-button"
          onClick={logout}
        >
          Cerrar sesión
        </button>
      </div>
    </main>
  );
};

export default AdminDashboard;  