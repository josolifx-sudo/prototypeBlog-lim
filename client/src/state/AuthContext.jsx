import { createContext, useEffect, useMemo, useState } from "react";
import api from "../utils/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);

  useEffect(() => {
    async function loadMe() {
      try {
        if (!token) {
          setUser(null);
          setLoadingMe(false);
          return;
        }
        const res = await api.get("/auth/me");
        setUser(res.data.user);
      } catch (err) {
        localStorage.removeItem("token");
        setToken("");
        setUser(null);
      } finally {
        setLoadingMe(false);
      }
    }
    loadMe();
  }, [token]);

  const value = useMemo(() => {
    return {
      token,
      user,
      loadingMe,
      setToken: (t) => {
        setToken(t);
        if (t) localStorage.setItem("token", t);
        else localStorage.removeItem("token");
      },
      setUser
    };
  }, [token, user, loadingMe]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}