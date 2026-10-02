import {
  findProducts,
  findProductByBarcode,
  createProduct as insertProduct,
} from "../models/producto.model.js";

export class ProductError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "ProductError";
    this.code = code;
  }
}

// Límites según el esquema de la tabla `productos`
const MAX_CODIGO_BARRAS = 50; // varchar(50)
const MAX_NOMBRE = 100; // varchar(100)
const MAX_PRECIO = 99999999.99; // decimal(10,2)
const MAX_STOCK = 2147483647; // int

// Solo acepta number o string numérico no vacío.
// Rechaza "", null, true, [] (que Number() convertiría a 0 o 1).
const parseNumber = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return NaN;
};

const isValidPrice = (n) =>
  Number.isFinite(n) && n >= 0 && n <= MAX_PRECIO && Number(n.toFixed(2)) === n; // máx. 2 decimales

export const registerProduct = async (data) => {
  const codigoBarras = String(data.codigoBarras ?? "").trim();
  const nombre = String(data.nombre ?? "").trim();
  const precioCosto = parseNumber(data.precioCosto);
  const precioVenta = parseNumber(data.precioVenta);
  const stock = parseNumber(data.stock);

  if (!codigoBarras || !nombre) {
    throw new ProductError(
      "MISSING_FIELDS",
      "El código de barras y el nombre son obligatorios"
    );
  }

  if (codigoBarras.length > MAX_CODIGO_BARRAS || nombre.length > MAX_NOMBRE) {
    throw new ProductError(
      "INVALID_VALUES",
      `El código de barras admite hasta ${MAX_CODIGO_BARRAS} caracteres y el nombre hasta ${MAX_NOMBRE}`
    );
  }

  if (
    !isValidPrice(precioCosto) ||
    !isValidPrice(precioVenta) ||
    !Number.isInteger(stock) ||
    stock < 0 ||
    stock > MAX_STOCK
  ) {
    throw new ProductError(
      "INVALID_VALUES",
      "Los precios (máx. 2 decimales) y el stock (entero) deben ser números válidos y no negativos"
    );
  }

  const existingProduct = await findProductByBarcode(codigoBarras);

  if (existingProduct) {
    throw new ProductError(
      "DUPLICATE_BARCODE",
      "Ya existe un producto con ese código de barras"
    );
  }

  const idProducto = await insertProduct({
    codigoBarras,
    nombre,
    precioCosto,
    precioVenta,
    stock,
  });

  return { idProducto, codigoBarras, nombre, precioCosto, precioVenta, stock };
};

export const searchProducts = async (search) => {
  const normalizedSearch = String(search ?? "").trim();

  return findProducts(normalizedSearch);
};