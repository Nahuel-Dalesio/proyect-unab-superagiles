import { apiRequest } from "./api";

// GET /api/productos?search=...
// Devuelve un array de productos. El cajero no recibe precioCosto.
export const getProductos = (search = "") => {
  const termino = search.trim();
  const query = termino ? `?search=${encodeURIComponent(termino)}` : "";

  return apiRequest(`/api/productos${query}`);
};

// GET /api/productos/stock-bajo
// Devuelve los productos activos con stock <= stockMinimo. Solo admin y encargado.
export const getProductosStockBajo = () =>
  apiRequest("/api/productos/stock-bajo");

// POST /api/productos
// Devuelve { message, product }. Solo admin y encargado.
export const crearProducto = (producto) =>
  apiRequest("/api/productos", { method: "POST", body: producto });

// PUT /api/productos/:id
// Actualización parcial: acepta codigoBarras, nombre, descripcion,
// precioCosto, precioVenta, stock y stockMinimo. Solo admin y encargado.
export const actualizarProducto = (id, producto) =>
  apiRequest(`/api/productos/${id}`, { method: "PUT", body: producto });

// PUT /api/productos/precios/porcentaje
// Aumenta masivamente el precio de venta de todos los productos activos. Solo admin y encargado.
export const actualizarPreciosPorPorcentaje = (porcentaje) =>
  apiRequest("/api/productos/precios/porcentaje", {
    method: "PUT",
    body: { porcentaje },
  });
