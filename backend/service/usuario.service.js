import bcrypt from "bcryptjs";
import {
  findUsers,
  findUserById,
  findUserByUsernameForManagement,
  createUser as insertUser,
  updateUserById,
} from "../models/usuario.model.js";

export class UserError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "UserError";
    this.code = code;
  }
}

const VALID_ROLES = ["admin", "encargado", "cajero"];
const MAX_USERNAME = 50;
const MIN_PASSWORD = 8;
const MAX_PASSWORD_BYTES = 72;

const parseId = (value) => {
  if (typeof value === "number") return value;

  if (typeof value === "string" && value.trim() !== "") {
    return Number(value);
  }

  return NaN;
};

const parseActive = (value) => {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  return null;
};

const isValidPassword = (password) =>
  typeof password === "string" &&
  password.length >= MIN_PASSWORD &&
  Buffer.byteLength(password, "utf8") <= MAX_PASSWORD_BYTES;

const serializeUser = (user) => ({
  idUsuario: user.idUsuario,
  username: user.username,
  rol: user.rol,
  activo: Boolean(user.activo),
});

export const searchUsers = async (search = "") => {
  const normalizedSearch = String(search ?? "").trim();
  const users = await findUsers(normalizedSearch);

  return users.map(serializeUser);
};

export const getUser = async (id) => {
  const idUsuario = parseId(id);

  if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
    throw new UserError("INVALID_ID", "El ID del usuario no es válido");
  }

  const user = await findUserById(idUsuario);

  if (!user) {
    throw new UserError("USER_NOT_FOUND", "Usuario no encontrado");
  }

  return serializeUser(user);
};

export const registerUser = async (data = {}) => {
  const username = String(data.username ?? "").trim().toLowerCase();
  const password =
    typeof data.password === "string" ? data.password : "";
  const rol = String(data.rol ?? "").trim().toLowerCase();

  const activo =
    data.activo === undefined ? true : parseActive(data.activo);

  if (!username || !password || !rol) {
    throw new UserError(
      "MISSING_FIELDS",
      "El usuario, la contraseña y el rol son obligatorios"
    );
  }

  if (username.length > MAX_USERNAME) {
    throw new UserError(
      "INVALID_VALUES",
      `El nombre de usuario admite hasta ${MAX_USERNAME} caracteres`
    );
  }

  if (!isValidPassword(password)) {
    throw new UserError(
      "INVALID_VALUES",
      `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres y no superar ${MAX_PASSWORD_BYTES} bytes`
    );
  }

  if (!VALID_ROLES.includes(rol)) {
    throw new UserError(
      "INVALID_ROLE",
      "El rol debe ser admin, encargado o cajero"
    );
  }

  if (activo === null) {
    throw new UserError(
      "INVALID_VALUES",
      "El estado activo debe ser verdadero o falso"
    );
  }

  const existingUser =
    await findUserByUsernameForManagement(username);

  if (existingUser) {
    throw new UserError(
      "DUPLICATE_USERNAME",
      "Ya existe un usuario con ese nombre"
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const idUsuario = await insertUser({
    username,
    hashedPassword,
    rol,
    activo,
  });

  return serializeUser({
    idUsuario,
    username,
    rol,
    activo,
  });
};

export const updateUser = async (
  id,
  data = {},
  authenticatedUserId = null
) => {
  const idUsuario = parseId(id);

  if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
    throw new UserError("INVALID_ID", "El ID del usuario no es válido");
  }

  const changes = {};
  let newPassword;

  if (data.username !== undefined) {
    changes.username = String(data.username ?? "")
      .trim()
      .toLowerCase();
  }

  if (
    data.password !== undefined &&
    data.password !== null &&
    data.password !== ""
  ) {
    if (typeof data.password !== "string") {
      throw new UserError(
        "INVALID_VALUES",
        "La contraseña debe ser un texto"
      );
    }

    newPassword = data.password;
  }

  if (data.rol !== undefined) {
    changes.rol = String(data.rol ?? "").trim().toLowerCase();
  }

  if (data.activo !== undefined) {
    changes.activo = parseActive(data.activo);
  }

  if (
    Object.keys(changes).length === 0 &&
    newPassword === undefined
  ) {
    throw new UserError(
      "MISSING_FIELDS",
      "No se envió ningún campo para actualizar"
    );
  }

  if ("username" in changes && !changes.username) {
    throw new UserError(
      "MISSING_FIELDS",
      "El nombre de usuario no puede quedar vacío"
    );
  }

  if (
    changes.username &&
    changes.username.length > MAX_USERNAME
  ) {
    throw new UserError(
      "INVALID_VALUES",
      `El nombre de usuario admite hasta ${MAX_USERNAME} caracteres`
    );
  }

  if (
    newPassword !== undefined &&
    !isValidPassword(newPassword)
  ) {
    throw new UserError(
      "INVALID_VALUES",
      `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres y no superar ${MAX_PASSWORD_BYTES} bytes`
    );
  }

  if (
    "rol" in changes &&
    !VALID_ROLES.includes(changes.rol)
  ) {
    throw new UserError(
      "INVALID_ROLE",
      "El rol debe ser admin, encargado o cajero"
    );
  }

  if ("activo" in changes && changes.activo === null) {
    throw new UserError(
      "INVALID_VALUES",
      "El estado activo debe ser verdadero o falso"
    );
  }

  const currentUserId = parseId(authenticatedUserId);

  if (
    idUsuario === currentUserId &&
    changes.activo === false
  ) {
    throw new UserError(
      "CANNOT_DEACTIVATE_SELF",
      "No podés desactivar tu propio usuario"
    );
  }

  const existingUser = await findUserById(idUsuario);

  if (!existingUser) {
    throw new UserError(
      "USER_NOT_FOUND",
      "Usuario no encontrado"
    );
  }

  if (
    changes.username &&
    changes.username !== existingUser.username
  ) {
    const duplicated =
      await findUserByUsernameForManagement(
        changes.username,
        idUsuario
      );

    if (duplicated) {
      throw new UserError(
        "DUPLICATE_USERNAME",
        "Ya existe un usuario con ese nombre"
      );
    }
  }

  const databaseChanges = { ...changes };

  if (newPassword !== undefined) {
    databaseChanges.password = await bcrypt.hash(
      newPassword,
      10
    );
  }

  await updateUserById(idUsuario, databaseChanges);

  return serializeUser({
    ...existingUser,
    ...changes,
  });
};

export const deactivateUser = async (
  id,
  authenticatedUserId = null
) => {
  const idUsuario = parseId(id);

  if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
    throw new UserError(
      "INVALID_ID",
      "El ID del usuario no es válido"
    );
  }

  const currentUserId = parseId(authenticatedUserId);

  if (idUsuario === currentUserId) {
    throw new UserError(
      "CANNOT_DEACTIVATE_SELF",
      "No podés desactivar tu propio usuario"
    );
  }

  const existingUser = await findUserById(idUsuario);

  if (!existingUser) {
    throw new UserError(
      "USER_NOT_FOUND",
      "Usuario no encontrado"
    );
  }

  if (existingUser.activo) {
    await updateUserById(idUsuario, { activo: false });
  }

  return serializeUser({
    ...existingUser,
    activo: false,
  });
};