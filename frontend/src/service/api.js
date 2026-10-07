import { BASE_URL } from "../config";

// Datos de prueba (mock) para desarrollo visual frontend sin backend activo
let MOCK_PRODUCTOS = [
  {
    idProducto: 1,
    codigoBarras: "750100000001",
    nombre: "Cerveza Duff 473ml",
    descripcion: "Cerveza rubia tradicional de Springfield",
    precioCosto: "1200.00",
    precioVenta: "1800.00",
    stock: 45,
    stockMinimo: 10,
  },
  {
    idProducto: 2,
    codigoBarras: "750100000002",
    nombre: "Squishee de Menta",
    descripcion: "Bebida congelada súper batida",
    precioCosto: "800.00",
    precioVenta: "1400.00",
    stock: 30,
    stockMinimo: 5,
  },
  {
    idProducto: 3,
    codigoBarras: "750100000003",
    nombre: "Krusty Burger Doble",
    descripcion: "Hamburguesa clásica con queso extra",
    precioCosto: "2500.00",
    precioVenta: "3800.00",
    stock: 15,
    stockMinimo: 5,
  },
  {
    idProducto: 4,
    codigoBarras: "750100000004",
    nombre: "Rosquilla Glaseada de Chocolate",
    descripcion: "Rosquilla gigante con chispas de colores",
    precioCosto: "400.00",
    precioVenta: "750.00",
    stock: 80,
    stockMinimo: 20,
  },
  {
    idProducto: 5,
    codigoBarras: "750100000005",
    nombre: "Chicle Bazooka Xtreme",
    descripcion: "Chicle sabor menta intensa",
    precioCosto: "150.00",
    precioVenta: "300.00",
    stock: 4,
    stockMinimo: 10,
  },
];

const handleMockFallback = (path, method, body) => {
  const url = new URL(path, "http://localhost");

  // GET /api/productos
  if (url.pathname.startsWith("/api/productos") && method === "GET") {
    const search = url.searchParams.get("search");
    if (!search) return [...MOCK_PRODUCTOS];
    const term = search.toLowerCase().trim();
    return MOCK_PRODUCTOS.filter(
      (p) =>
        p.nombre.toLowerCase().includes(term) ||
        String(p.codigoBarras).includes(term)
    );
  }

  // POST /api/productos
  if (url.pathname === "/api/productos" && method === "POST") {
    const nuevoProducto = {
      idProducto: Date.now(),
      ...body,
      precioCosto: body?.precioCosto ? String(body.precioCosto) : "0.00",
      precioVenta: body?.precioVenta ? String(body.precioVenta) : "0.00",
      stock: Number(body?.stock || 0),
      stockMinimo: Number(body?.stockMinimo || 5),
    };
    MOCK_PRODUCTOS.push(nuevoProducto);
    return { message: "Producto creado (Modo Prueba)", product: nuevoProducto };
  }

  return [];
};

// Request genérico a la API con el token de la sesión.
export const apiRequest = async (path, { method = "GET", body } = {}) => {
  const token = localStorage.getItem("token");

  try {
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
      if (token !== "mock-dev-token") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    if (!response.ok) {
      const error = new Error(data.message || "Error al comunicarse con el servidor");
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    // Si no hay conexión (backend offline), devolvemos datos mock para pruebas visuales
    if (!error.status) {
      console.warn("Backend no disponible. Usando datos de prueba (Modo Visual Frontend).");
      return handleMockFallback(path, method, body);
    }
    throw error;
  }
};