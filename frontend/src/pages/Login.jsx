import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import Swal from "sweetalert2";
import "./login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(BASE_URL + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);
        Swal.fire({
          title: "¡Bienvenido!",
          text: "Inicio de sesión exitoso.",
          icon: "success",
          customClass: {
            popup: "swal-mobile",
          },
        });
        if (data.user.rol === "admin") {
          navigate("/admin/productos");
        } else {
          navigate("/");
        }
      } else {
        Swal.fire({
          title: "Error",
          text: data.message || "Credenciales inválidas",
          icon: "error",
          customClass: {
            popup: "swal-mobile",
          },
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Error de conexión con el servidor",
        icon: "error",
        customClass: {
          popup: "swal-mobile",
        },
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Columna Izquierda: Logo Kwik-E-Mart */}
        <div className="login-banner">
          <div className="kwik-badge">
            <div className="kwik-logo-inner">
              <span className="kwik-text-top">KWIK-E</span>
              <span className="kwik-text-bottom">MART</span>
            </div>
          </div>
          <span className="kwik-tagline">Punto de Gestión</span>
        </div>

        {/* Columna Derecha: Formulario */}
        <div className="login-form-side">
          <h2>Iniciar Sesión</h2>
          <p className="login-subtitle">Ingresá tus datos para acceder al sistema</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Usuario</label>
              <input
                type="text"
                placeholder="ej: admin o cajero1"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-btn">
              Ingresar
            </button>
          </form>

          <div className="login-roles-info">
            Roles disponibles: Super Admin / Cajero
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;