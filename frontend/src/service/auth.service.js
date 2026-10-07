import { BASE_URL } from "../config";
import { ROLES } from "../utils/roles";

// Hace el request de login.
// - Si sale bien, devuelve { message, token, user }.
// - Si el backend responde con error (400/401/403/500), lanza un Error
//   con el message del backend y el status en error.status.
// - Si no hay conexión (backend offline), devuelve credenciales de prueba.
export const loginRequest = async (username, password) => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || "Credenciales inválidas");
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    if (!error.status) {
      console.warn("Backend no disponible. Accediendo con usuario de prueba (Modo Frontend Solo).");
      return {
        message: "Inicio de sesión de prueba exitoso",
        token: "mock-dev-token",
        user: {
          id: 1,
          username: username || "admin_demo",
          nombre: username || "Usuario Demo (Admin)",
          rol: ROLES.ADMIN,
        },
      };
    }
    throw error;
  }
};