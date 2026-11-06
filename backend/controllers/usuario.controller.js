import {
  searchUsers,
  getUser as getUserService,
  registerUser,
  updateUser as updateUserService,
  deactivateUser as deactivateUserService,
  UserError,
} from "../service/usuario.service.js";

const USER_ERROR_STATUS = {
  INVALID_ID: 400,
  MISSING_FIELDS: 400,
  INVALID_VALUES: 400,
  INVALID_ROLE: 400,
  USER_NOT_FOUND: 404,
  DUPLICATE_USERNAME: 409,
  CANNOT_DEACTIVATE_SELF: 400,
};

const handleUserError = (res, error, action) => {
  if (error instanceof UserError) {
    return res
      .status(USER_ERROR_STATUS[error.code] ?? 400)
      .json({ message: error.message });
  }

  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      message: "Ya existe un usuario con ese nombre",
    });
  }

  console.error(`Error al ${action}:`, error);

  return res.status(500).json({
    message: `Error interno al ${action}`,
  });
};

export const getUsers = async (req, res) => {
  try {
    const users = await searchUsers(req.query.search);

    return res.json(users);
  } catch (error) {
    return handleUserError(res, error, "obtener los usuarios");
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await getUserService(req.params.id);

    return res.json(user);
  } catch (error) {
    return handleUserError(res, error, "obtener el usuario");
  }
};

export const createUser = async (req, res) => {
  try {
    const user = await registerUser(req.body);

    return res.status(201).json({
      message: "Usuario creado correctamente",
      user,
    });
  } catch (error) {
    return handleUserError(res, error, "crear el usuario");
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await updateUserService(
      req.params.id,
      req.body,
      req.user.id
    );

    return res.json({
      message: "Usuario actualizado correctamente",
      user,
    });
  } catch (error) {
    return handleUserError(res, error, "actualizar el usuario");
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const user = await deactivateUserService(
      req.params.id,
      req.user.id
    );

    return res.json({
      message: "Usuario desactivado correctamente",
      user,
    });
  } catch (error) {
    return handleUserError(res, error, "desactivar el usuario");
  }
};