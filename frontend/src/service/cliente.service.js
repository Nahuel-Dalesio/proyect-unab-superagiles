import { apiRequest } from "./api";

// GET /api/clientes?search=...
// Devuelve un array de clientes filtrados por nombre, apellido, documento o email.
export const getClientes = (search = "") => {
  const termino = search.trim();
  const query = termino ? `?search=${encodeURIComponent(termino)}` : "";

  return apiRequest(`/api/clientes${query}`);
};

// GET /api/clientes/:id
// Devuelve los datos de un cliente específico por su ID.
export const getClienteById = (idCliente) =>
  apiRequest(`/api/clientes/${idCliente}`);

// POST /api/clientes
// Crea un nuevo cliente. Devuelve { message, client }.
export const crearCliente = (cliente) =>
  apiRequest("/api/clientes", {
    method: "POST",
    body: cliente,
  });

// PUT /api/clientes/:id
// Actualización parcial de un cliente (incluye activo). Devuelve { message, client }.
export const actualizarCliente = (idCliente, cambios) =>
  apiRequest(`/api/clientes/${idCliente}`, {
    method: "PUT",
    body: cambios,
  });

// DELETE /api/clientes/:id
// Desactiva lógicamente al cliente (activo = false). Devuelve { message, client }.
export const desactivarCliente = (idCliente) =>
  apiRequest(`/api/clientes/${idCliente}`, {
    method: "DELETE",
  });

