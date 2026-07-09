import { createContext, useContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

const decodeUser = (token) => {
  if (!token) return null;
  try {
    const payload = jwtDecode(token);
    if (payload.exp * 1000 < Date.now()) return null;
    return {
      id: payload.userId,
      name: payload.name,
      email: payload.email,
      role: payload.role || 'member',
    };
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const user = decodeUser(token);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
