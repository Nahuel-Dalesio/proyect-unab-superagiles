import {
  findClients,
  findClientById,
  findClientByDocument,
  createClient as insertClient,
  updateClientById,
} from "../models/cliente.model.js";

export class ClientError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "ClientError";
    this.code = code;
  }
}

const DOCUMENT_TYPES = ["DNI", "CUIT", "CUIL"];

const MAX_NOMBRE = 100;
const MAX_APELLIDO = 100;
const MAX_DOCUMENTO = 20;
const MAX_EMAIL = 100;
const MAX_TELEFONO = 30;
const MAX_DIRECCION = 255;
const MAX_CREDITO = 99999999.99;

const parseClientId = (value) => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new ClientError(
      "INVALID_ID",
      "El ID del cliente no es válido"
    );
  }

  return id;
};

const optionalText = (value) =>
  String(value ?? "").trim() || null;

const parseBooleanField = (value, errorMessage) => {
  if (value === true || value === 1 || value === "1") return true;
  if (value === false || value === 0 || value === "0") return false;

  throw new ClientError("INVALID_VALUES", errorMessage);
};

const parseActive = (value) =>
  parseBooleanField(
    value,
    "El estado activo debe ser verdadero o falso"
  );

const parseCreditLimit = (value) => {
  const limit = Number(value);

  if (
    !Number.isFinite(limit) ||
    limit < 0 ||
    limit > MAX_CREDITO ||
    Number(limit.toFixed(2)) !== limit
  ) {
    throw new ClientError(
      "INVALID_VALUES",
      "El límite de crédito debe ser un número no negativo con hasta 2 decimales"
    );
  }

  return limit;
};

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateLengths = ({
  nombre,
  apellido,
  numero_documento,
  email,
  telefono,
  direccion,
}) => {
  if (nombre !== undefined && nombre.length > MAX_NOMBRE) {
    throw new ClientError(
      "INVALID_VALUES",
      `El nombre admite hasta ${MAX_NOMBRE} caracteres`
    );
  }

  if (apellido && apellido.length > MAX_APELLIDO) {
    throw new ClientError(
      "INVALID_VALUES",
      `El apellido admite hasta ${MAX_APELLIDO} caracteres`
    );
  }

  if (
    numero_documento !== undefined &&
    numero_documento.length > MAX_DOCUMENTO
  ) {
    throw new ClientError(
      "INVALID_VALUES",
      `El número de documento admite hasta ${MAX_DOCUMENTO} caracteres`
    );
  }

  if (email && email.length > MAX_EMAIL) {
    throw new ClientError(
      "INVALID_VALUES",
      `El email admite hasta ${MAX_EMAIL} caracteres`
    );
  }

  if (telefono && telefono.length > MAX_TELEFONO) {
    throw new ClientError(
      "INVALID_VALUES",
      `El teléfono admite hasta ${MAX_TELEFONO} caracteres`
    );
  }

  if (direccion && direccion.length > MAX_DIRECCION) {
    throw new ClientError(
      "INVALID_VALUES",
      `La dirección admite hasta ${MAX_DIRECCION} caracteres`
    );
  }
};

const serializeClient = (client) => {
  const limiteCredito = Number(client.limite_credito ?? 0);
  const deudaActual = Number(client.deuda_actual ?? 0);

  return {
    ...client,
    activo: Boolean(client.activo),
    cuenta_corriente_habilitada: Boolean(
      client.cuenta_corriente_habilitada
    ),
    limite_credito: limiteCredito,
    deuda_actual: deudaActual,
    credito_disponible: Math.max(
      0,
      Math.round((limiteCredito - deudaActual) * 100) / 100
    ),
  };
};

export const searchClients = async (search) => {
  const normalizedSearch = String(search ?? "").trim();
  const clients = await findClients(normalizedSearch);

  return clients.map(serializeClient);
};

export const getClient = async (id) => {
  const idCliente = parseClientId(id);
  const client = await findClientById(idCliente);

  if (!client) {
    throw new ClientError(
      "CLIENT_NOT_FOUND",
      "Cliente no encontrado"
    );
  }

  return serializeClient(client);
};

export const registerClient = async (data = {}) => {
  const nombre = String(data.nombre ?? "").trim();
  const apellido = optionalText(data.apellido);
  const tipo_documento = String(
    data.tipo_documento ?? ""
  ).trim().toUpperCase();
  const numero_documento = String(
    data.numero_documento ?? ""
  ).trim();
  const email = optionalText(data.email);
  const telefono = optionalText(data.telefono);
  const direccion = optionalText(data.direccion);

  const limite_credito =
    data.limite_credito !== undefined && data.limite_credito !== ""
      ? parseCreditLimit(data.limite_credito)
      : 0;

  const cuenta_corriente_habilitada =
    data.cuenta_corriente_habilitada !== undefined
      ? parseBooleanField(
          data.cuenta_corriente_habilitada,
          "La habilitación de cuenta corriente debe ser verdadera o falsa"
        )
      : limite_credito > 0;

  if (!nombre || !tipo_documento || !numero_documento) {
    throw new ClientError(
      "MISSING_FIELDS",
      "El nombre, el tipo y el número de documento son obligatorios"
    );
  }

  if (!DOCUMENT_TYPES.includes(tipo_documento)) {
    throw new ClientError(
      "INVALID_VALUES",
      "El tipo de documento debe ser DNI, CUIT o CUIL"
    );
  }

  validateLengths({
    nombre,
    apellido,
    numero_documento,
    email,
    telefono,
    direccion,
  });

  if (email && !isValidEmail(email)) {
    throw new ClientError(
      "INVALID_VALUES",
      "El email no tiene un formato válido"
    );
  }

  const duplicatedClient =
    await findClientByDocument(numero_documento);

  if (duplicatedClient) {
    throw new ClientError(
      "DUPLICATE_DOCUMENT",
      "Ya existe un cliente con ese número de documento"
    );
  }

  const id_cliente = await insertClient({
    nombre,
    apellido,
    tipo_documento,
    numero_documento,
    email,
    telefono,
    direccion,
    cuenta_corriente_habilitada,
    limite_credito: cuenta_corriente_habilitada ? limite_credito : 0,
  });

  return serializeClient({
    id_cliente,
    nombre,
    apellido,
    tipo_documento,
    numero_documento,
    email,
    telefono,
    direccion,
    cuenta_corriente_habilitada,
    limite_credito: cuenta_corriente_habilitada ? limite_credito : 0,
    deuda_actual: 0,
    activo: true,
  });
};

export const updateClient = async (id, data = {}) => {
  const idCliente = parseClientId(id);
  const existingClient = await findClientById(idCliente);

  if (!existingClient) {
    throw new ClientError(
      "CLIENT_NOT_FOUND",
      "Cliente no encontrado"
    );
  }

  const changes = {};

  if (data.nombre !== undefined) {
    changes.nombre = String(data.nombre ?? "").trim();
  }

  if (data.apellido !== undefined) {
    changes.apellido = optionalText(data.apellido);
  }

  if (data.tipo_documento !== undefined) {
    changes.tipo_documento = String(
      data.tipo_documento ?? ""
    ).trim().toUpperCase();
  }

  if (data.numero_documento !== undefined) {
    changes.numero_documento = String(
      data.numero_documento ?? ""
    ).trim();
  }

  if (data.email !== undefined) {
    changes.email = optionalText(data.email);
  }

  if (data.telefono !== undefined) {
    changes.telefono = optionalText(data.telefono);
  }

  if (data.direccion !== undefined) {
    changes.direccion = optionalText(data.direccion);
  }

  if (data.activo !== undefined) {
    changes.activo = parseActive(data.activo);
  }

  if (data.cuenta_corriente_habilitada !== undefined) {
    changes.cuenta_corriente_habilitada = parseBooleanField(
      data.cuenta_corriente_habilitada,
      "La habilitación de cuenta corriente debe ser verdadera o falsa"
    );
  }

  if (data.limite_credito !== undefined) {
    changes.limite_credito = parseCreditLimit(data.limite_credito);
  }

  if (data.deuda_actual !== undefined) {
    changes.deuda_actual = parseCreditLimit(data.deuda_actual);
  }

  if (Object.keys(changes).length === 0) {
    throw new ClientError(
      "MISSING_FIELDS",
      "No se envió ningún campo para actualizar"
    );
  }

  if ("nombre" in changes && !changes.nombre) {
    throw new ClientError(
      "MISSING_FIELDS",
      "El nombre no puede quedar vacío"
    );
  }

  if (
    "tipo_documento" in changes &&
    !DOCUMENT_TYPES.includes(changes.tipo_documento)
  ) {
    throw new ClientError(
      "INVALID_VALUES",
      "El tipo de documento debe ser DNI, CUIT o CUIL"
    );
  }

  if (
    "numero_documento" in changes &&
    !changes.numero_documento
  ) {
    throw new ClientError(
      "MISSING_FIELDS",
      "El número de documento no puede quedar vacío"
    );
  }

  validateLengths(changes);

  if (changes.email && !isValidEmail(changes.email)) {
    throw new ClientError(
      "INVALID_VALUES",
      "El email no tiene un formato válido"
    );
  }

  if (
    changes.numero_documento &&
    changes.numero_documento !== existingClient.numero_documento
  ) {
    const duplicatedClient = await findClientByDocument(
      changes.numero_documento,
      idCliente
    );

    if (duplicatedClient) {
      throw new ClientError(
        "DUPLICATE_DOCUMENT",
        "Ya existe un cliente con ese número de documento"
      );
    }
  }

  // Si se deshabilita la cuenta corriente y el límite pasa a 0, también reiniciamos deuda_actual si no fue enviada
  if (
    changes.cuenta_corriente_habilitada === false &&
    changes.limite_credito === 0 &&
    changes.deuda_actual === undefined
  ) {
    changes.deuda_actual = 0;
  }

  const deudaFinal =
    changes.deuda_actual !== undefined
      ? changes.deuda_actual
      : Number(existingClient.deuda_actual ?? 0);

  const limiteFinal =
    changes.limite_credito !== undefined
      ? changes.limite_credito
      : Number(existingClient.limite_credito ?? 0);

  if (limiteFinal < deudaFinal) {
    throw new ClientError(
      "INVALID_VALUES",
      "El límite de cuenta corriente no puede ser menor que el saldo ya utilizado por el cliente"
    );
  }

  await updateClientById(idCliente, changes);

  return serializeClient({
    ...existingClient,
    ...changes,
  });
};

export const configureClientAccount = async (id, data = {}) => {
  const idCliente = parseClientId(id);
  const existingClient = await findClientById(idCliente);

  if (!existingClient) {
    throw new ClientError(
      "CLIENT_NOT_FOUND",
      "Cliente no encontrado"
    );
  }

  const changes = {};

  if (data.cuenta_corriente_habilitada !== undefined) {
    changes.cuenta_corriente_habilitada = parseBooleanField(
      data.cuenta_corriente_habilitada,
      "La habilitación de cuenta corriente debe ser verdadera o falsa"
    );
  }

  if (data.limite_credito !== undefined) {
    changes.limite_credito = parseCreditLimit(
      data.limite_credito
    );
  }

  if (data.deuda_actual !== undefined) {
    changes.deuda_actual = parseCreditLimit(data.deuda_actual);
  }

  if (Object.keys(changes).length === 0) {
    throw new ClientError(
      "MISSING_FIELDS",
      "Debe indicar si habilita la cuenta corriente o definir un límite de crédito"
    );
  }

  const deudaActual =
    changes.deuda_actual !== undefined
      ? changes.deuda_actual
      : Number(existingClient.deuda_actual ?? 0);
  const nuevoLimite =
    changes.limite_credito ??
    Number(existingClient.limite_credito ?? 0);

  if (nuevoLimite < deudaActual) {
    throw new ClientError(
      "INVALID_VALUES",
      "El límite de crédito no puede ser menor que la deuda actual"
    );
  }

  await updateClientById(idCliente, changes);

  return serializeClient({
    ...existingClient,
    ...changes,
  });
};
