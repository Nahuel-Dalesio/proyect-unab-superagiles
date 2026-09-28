import { loginUser, AuthError } from "../service/auth.service.js";

// Traduce el code de negocio del service a un status HTTP
const AUTH_ERROR_STATUS = {
  INVALID_CREDENTIALS: 401,
  USER_INACTIVE: 403,
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Usuario y contraseña requeridos" });
  }

  try {
    const { token, user } = await loginUser(username, password);

    res.json({
      message: "Login exitoso",
      token,
      user,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return res
        .status(AUTH_ERROR_STATUS[error.code] ?? 400)
        .json({ message: error.message });
    }

    res.status(500).json({ message: "Error al iniciar sesión", error: error.message });
  }
};