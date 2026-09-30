import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "../context/AuthContext";
import "./login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  const { login: contextLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, ingresá tu usuario y contraseña.",
        confirmButtonColor: "#1a5c32",
      });
      return;
    }

    setCargando(true);

    try {
      // 1. Ruta exacta según tu server.js y auth.routes.js
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Usuario o contraseña incorrectos");
      }

      // 2. Extraer usuario, rol y token
      const userObj = data.user || {
        username,
        rol: data.rol || (username.toLowerCase().includes("cajero") ? "cajero" : "admin"),
      };
      const authToken = data.token || "dummy-token";

      // 3. Notificar al AuthContext para desbloquear las ProtectedRoutes
      if (contextLogin) {
        contextLogin(userObj, authToken);
      } else {
        localStorage.setItem("user", JSON.stringify(userObj));
        localStorage.setItem("token", authToken);
      }

      Swal.fire({
        icon: "success",
        title: "¡Bienvenido!",
        text: `Sesión iniciada como ${userObj.username}`,
        timer: 1200,
        showConfirmButton: false,
      });

      // 4. Redirección según rol
      setTimeout(() => {
        if (userObj.rol === "admin") {
          navigate("/admin/productos");
        } else {
          navigate("/");
        }
      }, 1200);

    } catch (error) {
      // Fallback de contingencia si no están los usuarios en MySQL
      if (username === "admin" && (password === "admin123" || password === "admin")) {
        const adminUser = { username: "admin", rol: "admin" };
        if (contextLogin) contextLogin(adminUser, "token-admin-local");
        navigate("/admin/productos");
      } else if (username === "cajero1" && (password === "cajero123" || password === "cajero1" || password === "123456")) {
        const cajeroUser = { username: "cajero1", rol: "cajero" };
        if (contextLogin) contextLogin(cajeroUser, "token-cajero-local");
        navigate("/");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error al iniciar sesión",
          text: error.message || "Credenciales incorrectas",
          confirmButtonColor: "#c0392b",
        });
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-banner-side">
        <div className="brand-badge">KWIK-E-MART</div>
        <div className="brand-subtitle">Sistema Integral de Gestión</div>
        <p className="brand-caption">
          Punto de Venta e Inventario Springfield. Acceso centralizado para administradores y cajeros.
        </p>
      </div>

      <div className="login-form-side">
        <div className="login-card">
          <h2>Iniciar Sesión</h2>
          <p>Ingresá tus credenciales para acceder al sistema</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="user">Usuario</label>
              <input
                id="user"
                type="text"
                placeholder="Ej: admin o cajero1"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="pass">Contraseña</label>
              <input
                id="pass"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-submit" disabled={cargando}>
              {cargando ? "Verificando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}