import {
  findProducts,
  findProductByBarcode,
  findProductById,
  createProduct as insertProduct,
  updateProductById,
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
const MAX_DESCRIPCION = 255; // varchar(255)
const MAX_PRECIO = 99999999.99; // decimal(10,2)
const MAX_STOCK = 2147483647; // int

// Solo acepta number o string numérico no vacío.
// Rechaza "", null, true, [] (que Number() convertiría a 0 o 1).
const parseNumber = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return NaN;
};

// Un campo opcional "no vino" si es undefined, null o un string vacío.
const isBlank = (value) =>
  value === undefined ||
  value === null ||
  (typeof value === "string" && value.trim() === "");

const isValidPrice = (n) =>
  Number.isFinite(n) && n >= 0 && n <= MAX_PRECIO && Number(n.toFixed(2)) === n; // máx. 2 decimales

const isValidCount = (n) => Number.isInteger(n) && n >= 0 && n <= MAX_STOCK;

export const registerProduct = async (data) => {
  const codigoBarras = String(data.codigoBarras ?? "").trim();
  const nombre = String(data.nombre ?? "").trim();
  // Descripción opcional: vacía se guarda como NULL, no como ""
  const descripcion = String(data.descripcion ?? "").trim() || null;
  const precioCosto = parseNumber(data.precioCosto);
  const precioVenta = parseNumber(data.precioVenta);
  const stock = parseNumber(data.stock);
  // Stock mínimo opcional: si no viene, vale 0 (igual que el default de la tabla)
  const stockMinimo = isBlank(data.stockMinimo) ? 0 : parseNumber(data.stockMinimo);

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

  if (descripcion && descripcion.length > MAX_DESCRIPCION) {
    throw new ProductError(
      "INVALID_VALUES",
      `La descripción admite hasta ${MAX_DESCRIPCION} caracteres`
    );
  }

  if (
    !isValidPrice(precioCosto) ||
    !isValidPrice(precioVenta) ||
    !isValidCount(stock) ||
    !isValidCount(stockMinimo)
  ) {
    throw new ProductError(
      "INVALID_VALUES",
      "Los precios (máx. 2 decimales) deben ser números válidos y no negativos; el stock y el stock mínimo deben ser enteros no negativos"
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
    descripcion,
    precioCosto,
    precioVenta,
    stock,
    stockMinimo,
  });

  return {
    idProducto,
    codigoBarras,
    nombre,
    descripcion,
    precioCosto,
    precioVenta,
    stock,
    stockMinimo,
  };
};

const ROLES_CON_COSTO = ["admin", "encargado"];

export const searchProducts = async (search, rol) => {
  const normalizedSearch = String(search ?? "").trim();
  const products = await findProducts(normalizedSearch);

  if (ROLES_CON_COSTO.includes(rol)) return products;

  return products.map(({ precioCosto, ...resto }) => resto);
};

export const updateProduct = async (id, data) => {
  const idProducto = parseNumber(id);
  const precioCosto = parseNumber(data.precioCosto);
  const precioVenta = parseNumber(data.precioVenta);
  const stock = parseNumber(data.stock);

  if (!Number.isInteger(idProducto) || idProducto <= 0) {
    throw new ProductError("INVALID_ID", "El ID del producto no es válido");
  }

  const existingProduct = await findProductById(idProducto);

  if (!existingProduct) {
    throw new ProductError("PRODUCT_NOT_FOUND", "Producto no encontrado");
  }

  if (
    !isValidPrice(precioCosto) ||
    !isValidPrice(precioVenta) ||
    !isValidCount(stock)
  ) {
    throw new ProductError(
      "INVALID_VALUES",
      "Los precios deben ser válidos y no negativos; el stock debe ser un entero no negativo"
    );
  }

  await updateProductById({
    idProducto,
    precioCosto,
    precioVenta,
    stock,
  });

  return {
    ...existingProduct,
    precioCosto,
    precioVenta,
    stock,
  };
};