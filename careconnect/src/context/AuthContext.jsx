import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("atdoor_token") || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Restore authenticated session from backend using saved token
  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      if (typeof window === "undefined") {
        setLoading(false);
        return;
      }

      const savedToken = localStorage.getItem("atdoor_token");
      if (!savedToken) {
        if (mounted) {
          setUser(null);
          setToken(null);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await authApi.getMe();
        if (mounted && res?.success && res.data) {
          setUser(res.data);
          setToken(savedToken);
        } else if (mounted) {
          localStorage.removeItem("atdoor_token");
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.warn("[Auth] Token invalid or expired:", err.message);
        if (mounted) {
          localStorage.removeItem("atdoor_token");
          setUser(null);
          setToken(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, [token]);

  // Real login API call
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authApi.login(email.trim().toLowerCase(), password);
      if (res?.success && res.token && res.user) {
        if (typeof window !== "undefined") {
          localStorage.setItem("atdoor_token", res.token);
        }
        setToken(res.token);
        setUser(res.user);
        setLoading(false);
        return { success: true, user: res.user };
      }
      setLoading(false);
      return { success: false, message: res?.message || "Invalid email or password" };
    } catch (err) {
      setLoading(false);
      return {
        success: false,
        message: err.message || err.response?.data?.message || "Login failed. Please check credentials.",
      };
    }
  };

  // Real register API call
  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authApi.register(userData);
      if (res?.success && res.token && res.user) {
        if (typeof window !== "undefined") {
          localStorage.setItem("atdoor_token", res.token);
        }
        setToken(res.token);
        setUser(res.user);
        setLoading(false);
        return { success: true, user: res.user };
      }
      setLoading(false);
      return { success: false, message: res?.message || "Registration failed" };
    } catch (err) {
      setLoading(false);
      return {
        success: false,
        message: err.message || err.response?.data?.message || "Registration failed",
      };
    }
  };

  // Real logout: clears token and user
  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("atdoor_token");
    }
    setToken(null);
    setUser(null);
  };

  const role = user?.role || "GUEST";
  const isAuthenticated = Boolean(user && token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
