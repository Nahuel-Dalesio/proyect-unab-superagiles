import React, { createContext, useState, useEffect } from "react";
import { ROLES } from "../utils/roles";

export const AuthContext = createContext();

export const DEFAULT_MOCK_USER = {
  id: 1,
  username: "admin_demo",
  nombre: "Usuario Demo (Admin)",
  rol: ROLES.ADMIN,
};

export const DEFAULT_MOCK_TOKEN = "mock-dev-token";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : DEFAULT_MOCK_USER;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || DEFAULT_MOCK_TOKEN;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      localStorage.setItem("token", DEFAULT_MOCK_TOKEN);
      localStorage.setItem("user", JSON.stringify(DEFAULT_MOCK_USER));
    }
  }, []);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("token", userToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(DEFAULT_MOCK_USER);
    setToken(DEFAULT_MOCK_TOKEN);
    localStorage.setItem("token", DEFAULT_MOCK_TOKEN);
    localStorage.setItem("user", JSON.stringify(DEFAULT_MOCK_USER));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

