import {
  registerProduct,
  ProductError,
} from "../service/producto.service.js";

const PRODUCT_ERROR_STATUS = {
  MISSING_FIELDS: 400,
  INVALID_VALUES: 400,
  DUPLICATE_BARCODE: 409,
};

export const createProduct = async (req, res) => {
  try {
    const product = await registerProduct(req.body);

    return res.status(201).json({
      message: "Producto creado correctamente",
      product,
    });
  } catch (error) {
    if (error instanceof ProductError) {
      return res
        .status(PRODUCT_ERROR_STATUS[error.code] ?? 400)
        .json({ message: error.message });
    }

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Ya existe un producto con ese código de barras",
      });
    }

    console.error("Error al crear producto:", error);

    return res.status(500).json({
      message: "Error interno al crear el producto",
    });
  }
};