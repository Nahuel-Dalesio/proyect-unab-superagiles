import { apiRequest } from "./api";

// POST /api/ventas
// Registra una nueva venta. Recibe { items: [{ idProducto, cantidad }], medioPago, idCliente? }
export const registrarVenta = (venta) =>
  apiRequest("/api/ventas", {
    method: "POST",
    body: venta,
  });

// GET /api/ventas?desde=...&hasta=...&idUsuario=...
// Lista las ventas registradas con sus respectivos detalles.
export const getVentas = ({ desde = "", hasta = "", idUsuario = "" } = {}) => {
  const params = new URLSearchParams();

  if (desde) params.set("desde", desde);
  if (hasta) params.set("hasta", hasta);
  if (idUsuario) params.set("idUsuario", idUsuario);

  const query = params.toString();
  return apiRequest(`/api/ventas${query ? `?${query}` : ""}`);
};

// GET /api/ventas/:id
// Obtiene el detalle completo de una venta puntual por su ID.
export const getVentaById = (idVenta) =>
  apiRequest(`/api/ventas/${idVenta}`);

// PUT /api/ventas/:id/anular
// Anula una venta completada y restaura el stock de los productos. Solo admin y encargado.
export const anularVenta = (idVenta) =>
  apiRequest(`/api/ventas/${idVenta}/anular`, {
    method: "PUT",
  });

