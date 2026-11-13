import {
  searchClients,
  getClient as getClientData,
  registerClient,
  updateClient as updateClientData,
  configureClientAccount as configureClientAccountData,
  registerClientAccountPayment as registerClientAccountPaymentData,
  ClientError,
} from "../service/cliente.service.js";

const CLIENT_ERROR_STATUS = {
  MISSING_FIELDS: 400,
  INVALID_VALUES: 400,
  INVALID_ID: 400,
  CURRENT_ACCOUNT_DISABLED: 400,
  INVALID_PAYMENT_AMOUNT: 400,
  CLIENT_HAS_NO_DEBT: 400,
  PAYMENT_EXCEEDS_DEBT: 400,
  CLIENT_NOT_FOUND: 404,
  DUPLICATE_DOCUMENT: 409,
};

const handleClientError = (error, res) => {
  if (error instanceof ClientError) {
    return res
      .status(CLIENT_ERROR_STATUS[error.code] ?? 400)
      .json({ message: error.message });
  }

  if (error?.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      message: "Ya existe un cliente con ese número de documento",
    });
  }

  return null;
};

export const getClients = async (req, res) => {
  try {
    const clients = await searchClients(req.query.search);

    return res.status(200).json(clients);
  } catch (error) {
    console.error("Error al obtener clientes:", error);

    return res.status(500).json({
      message: "Error interno al obtener los clientes",
    });
  }
};

export const getClient = async (req, res) => {
  try {
    const client = await getClientData(req.params.id);

    return res.status(200).json(client);
  } catch (error) {
    const response = handleClientError(error, res);
    if (response) return response;

    console.error("Error al obtener cliente:", error);

    return res.status(500).json({
      message: "Error interno al obtener el cliente",
    });
  }
};

export const createClient = async (req, res) => {
  try {
    const client = await registerClient(req.body);

    return res.status(201).json({
      message: "Cliente creado correctamente",
      client,
    });
  } catch (error) {
    const response = handleClientError(error, res);
    if (response) return response;

    console.error("Error al crear cliente:", error);

    return res.status(500).json({
      message: "Error interno al crear el cliente",
    });
  }
};

export const updateClient = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (req.user?.rol === "cajero") {
      delete payload.activo;
    }

    const client = await updateClientData(
      req.params.id,
      payload
    );

    return res.status(200).json({
      message: "Cliente actualizado correctamente",
      client,
    });
  } catch (error) {
    const response = handleClientError(error, res);
    if (response) return response;

    console.error("Error al actualizar cliente:", error);

    return res.status(500).json({
      message: "Error interno al actualizar el cliente",
    });
  }
};

export const deactivateClient = async (req, res) => {
  try {
    const client = await updateClientData(req.params.id, {
      activo: false,
    });

    return res.status(200).json({
      message: "Cliente desactivado correctamente",
      client,
    });
  } catch (error) {
    const response = handleClientError(error, res);
    if (response) return response;

    console.error("Error al desactivar cliente:", error);

    return res.status(500).json({
      message: "Error interno al desactivar el cliente",
    });
  }
};

export const configureCurrentAccount = async (req, res) => {
  try {
    const client = await configureClientAccountData(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      message: "Cuenta corriente actualizada correctamente",
      client,
    });
  } catch (error) {
    const response = handleClientError(error, res);
    if (response) return response;

    console.error(
      "Error al configurar la cuenta corriente:",
      error
    );

    return res.status(500).json({
      message: "Error interno al configurar la cuenta corriente",
    });
  }
};

export const registerCurrentAccountPayment = async (req, res) => {
  try {
    const client = await registerClientAccountPaymentData(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      message: "Pago de cuenta corriente registrado correctamente",
      client,
    });
  } catch (error) {
    const response = handleClientError(error, res);
    if (response) return response;

    console.error(
      "Error al registrar el pago de cuenta corriente:",
      error
    );

    return res.status(500).json({
      message: "Error interno al registrar el pago de cuenta corriente",
    });
  }
};