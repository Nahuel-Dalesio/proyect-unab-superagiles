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

// PUT /api/productos/:id
// Actualiza precioCosto, precioVenta y stock. Solo admin y encargado.
export const actualizarProducto = (id, producto) =>
  apiRequest(`/api/productos/${id}`, { method: "PUT", body: producto });