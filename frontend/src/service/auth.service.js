import { BASE_URL } from "../config";

// Hace el request de login.
// - Si sale bien, devuelve { message, token, user }.
// - Si el backend responde con error (400/401/403/500), lanza un Error
//   con el message del backend y el status en error.status.
// - Si no hay conexión, fetch lanza su propio error (sin status).
export const loginRequest = async (username, password) => {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Credenciales inválidas");
    error.status = response.status;
    throw error;
  }

  return data;
};