import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { loginRequest } from "../service/auth.service";
import { showSuccess, showError } from "../utils/alerts";
import "./login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      showError("Ingresá tu usuario y contraseña.");
      return;
    }

    setCargando(true);

    try {
      const data = await loginRequest(username, password);

      // Sin usuario, rol o token válidos no se inicia sesión.
      // No se asume ningún rol ni token por defecto.
      if (!data?.user?.rol || !data?.token) {
        showError("Respuesta inválida del servidor. Contactá al administrador.");
        return;
      }

      login(data.user, data.token);
      showSuccess("Inicio de sesión exitoso.", "¡Bienvenido!");
      if (data.user.rol) navigate("/productos");
    } catch (error) {
      // Con status: el backend respondió con error. Sin status: falla de conexión.
      showError(
        error.status ? error.message : "Error de conexión con el servidor"
      );
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
          Punto de Venta e Inventario Springfield. Acceso centralizado para
          administradores y cajeros.
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
};

export default Login;