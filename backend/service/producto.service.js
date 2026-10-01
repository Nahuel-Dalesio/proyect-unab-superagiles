import {
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

export const registerProduct = async (data) => {
  const codigoBarras = String(data.codigoBarras || "").trim();
  const nombre = String(data.nombre || "").trim();
  const precioCosto = Number(data.precioCosto);
  const precioVenta = Number(data.precioVenta);
  const stock = Number(data.stock);

  if (!codigoBarras || !nombre) {
    throw new ProductError(
      "MISSING_FIELDS",
      "El código de barras y el nombre son obligatorios"
    );
  }

  if (
    !Number.isFinite(precioCosto) ||
    !Number.isFinite(precioVenta) ||
    !Number.isInteger(stock) ||
    precioCosto < 0 ||
    precioVenta < 0 ||
    stock < 0
  ) {
    throw new ProductError(
      "INVALID_VALUES",
      "Los precios y el stock deben ser números válidos y no negativos"
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

  return {
    idProducto,
    codigoBarras,
    nombre,
    precioCosto,
    precioVenta,
    stock,
  };
};