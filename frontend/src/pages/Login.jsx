import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../service/auth.service";
import { showSuccess, showError } from "../utils/alerts";
import "./login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginRequest(username, password);

      login(data.user, data.token);
      showSuccess("Inicio de sesión exitoso.", "¡Bienvenido!");
      navigate(data.user.rol === "admin" ? "/admin/productos" : "/");
    } catch (error) {
      // Con status: el backend respondió con error. Sin status: falla de conexión.
      showError(
        error.status ? error.message : "Error de conexión con el servidor"
      );
    }
  };

  return (
    <div className="login-container">
      <div
        style={{
          maxWidth: "400px",
          margin: "10px",
          width: "100%",
          padding: "30px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          backgroundColor: "#fff",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Iniciar sesión
        </h2>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <div>
            <label>Usuario:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                fontSize: "14px",
                width: "100%",
                padding: "10px",
                margin: "5px 0",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <div>
            <label>Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                fontSize: "14px",
                width: "100%",
                padding: "10px",
                margin: "5px 0",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "12px",
              background: "#333",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
              marginTop: "10px",
            }}
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;