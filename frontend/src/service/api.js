import { BASE_URL } from "../config";

// Request genérico a la API con el token de la sesión.
// - Si sale bien, devuelve el JSON del backend.
// - Si el backend responde con error, lanza un Error con el message del
//   backend y el status en error.status (igual que loginRequest).
// - Si no hay conexión, fetch lanza su propio error (sin status).
// - Ante un 401 (token inválido o vencido) limpia la sesión y manda a /login.
export const apiRequest = async (path, { method = "GET", body } = {}) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  // Si el body no es JSON (vacío, HTML de error), no rompemos
  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  if (!response.ok) {
    const error = new Error(data.message || "Error al comunicarse con el servidor");
    error.status = response.status;
    throw error;
  }

  return data;
};