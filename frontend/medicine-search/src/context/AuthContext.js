import { createContext, useContext, useState, useEffect } from "react";
import { getToken, setToken, removeToken } from "../utils/token.util";

const AuthContext = createContext(null);

// JWT decode helper (no library)
const parseToken = (token) => {
  try {
    const base64Payload = token.split(".")[1];
    if (!base64Payload) return null;
    return JSON.parse(atob(base64Payload));
  } catch (err) {
    return null;
  }
};

const getInitialUser = () => {
  const token = getToken();
  if (!token) return null;

  const payload = parseToken(token);
  if (!payload) return null;

  return {
    id: payload.id,
    email: payload.email,
    username: payload.username || payload.email,
    role: payload.role,
    employeeId: payload.employeeId,
    menuAccess: payload.menuAccess || []
  };
};

export const AuthProvider = ({ children }) => {
  const [authed, setAuthed] = useState(!!getToken());
  const [user, setUser] = useState(getInitialUser());

  // `sessionStorage` keeps the token for the current browser tab but clears automatically when the browser is closed.
  // This makes login required again on every new browser session, matching university-style behavior.

  const login = (token, userData) => {
    setToken(token);

    if (userData) {
      setUser({
        id: userData.id,
        email: userData.email,
        username: userData.username || userData.email,
        role: userData.role,
        employeeId: userData.employeeId,
        menuAccess: userData.menuAccess || []
      });
    } else {
      const payload = parseToken(token);
      if (payload) {
        setUser({
          id: payload.id,
          email: payload.email,
          username: payload.username || payload.email,
          role: payload.role,
          employeeId: payload.employeeId,
          menuAccess: payload.menuAccess || []
        });
      }
    }

    setAuthed(true);
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setAuthed(false);
  };

  const role = user?.role || null;
  const menuAccess = user?.menuAccess || [];

  return (
    <AuthContext.Provider
      value={{
        authed,
        user,
        role,
        menuAccess,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ ONLY THIS SHOULD BE USED EVERYWHERE
export const useAuth = () => {
  return useContext(AuthContext);
};
