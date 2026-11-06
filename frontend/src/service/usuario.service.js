import { apiRequest } from "./api";

// GET /api/usuarios?search=...
// Devuelve un array de usuarios filtrados por username o rol.
export const getUsuarios = (search = "") => {
  const termino = search.trim();
  const query = termino ? `?search=${encodeURIComponent(termino)}` : "";

  return apiRequest(`/api/usuarios${query}`);
};

// GET /api/usuarios/:id
// Devuelve los datos de un usuario específico por su ID.
export const getUsuarioById = (idUsuario) =>
  apiRequest(`/api/usuarios/${idUsuario}`);

// POST /api/usuarios
// Crea un nuevo usuario. Devuelve { message, user }.
export const crearUsuario = (usuario) =>
  apiRequest("/api/usuarios", {
    method: "POST",
    body: usuario,
  });

// PUT /api/usuarios/:id
// Actualización parcial de un usuario (username, password, rol, activo). Devuelve { message, user }.
export const actualizarUsuario = (idUsuario, cambios) =>
  apiRequest(`/api/usuarios/${idUsuario}`, {
    method: "PUT",
    body: cambios,
  });

// DELETE /api/usuarios/:id
// Desactiva lógicamente al usuario (activo = false). Devuelve { message, user }.
export const desactivarUsuario = (idUsuario) =>
  apiRequest(`/api/usuarios/${idUsuario}`, {
    method: "DELETE",
  });

