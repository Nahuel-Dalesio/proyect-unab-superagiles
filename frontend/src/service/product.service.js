import { apiRequest } from "./api";

// GET /api/productos?search=...
// Devuelve un array de productos. El cajero no recibe precioCosto.
export const getProductos = (search = "") => {
  const termino = search.trim();
  const query = termino ? `?search=${encodeURIComponent(termino)}` : "";

  return apiRequest(`/api/productos${query}`);
};

// POST /api/productos
// Devuelve { message, product }. Solo admin y encargado.
export const crearProducto = (producto) =>
  apiRequest("/api/productos", { method: "POST", body: producto });