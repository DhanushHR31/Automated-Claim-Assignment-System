import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  role: string | null;
  displayName: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, fullName: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const API_BASE = "http://localhost:8000";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem("manager_token"));

  const checkAuth = async () => {
    if (!token) { setLoading(false); return; }
    try {
      const resp = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        // Only allow staff roles in customer-support
        if (data.role === "customer") {
          localStorage.removeItem("manager_token");
          setToken(null);
          setLoading(false);
          return;
        }
        setUser(data);
      } else {
        localStorage.removeItem("manager_token");
        setToken(null);
      }
    } catch (err) {
      console.error("Auth check error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { checkAuth(); }, [token]);

  /** OAuth2 form-based login — uses /token endpoint */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const resp = await fetch(`${API_BASE}/token`, {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) {
        const err = await resp.json();
        toast.error(err.detail || "Login failed");
        return false;
      }

      const data = await resp.json();
      localStorage.setItem("manager_token", data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      toast.success("Logged in successfully");
      return true;
    } catch {
      toast.error("Connection error — is the backend running?");
      return false;
    }
  };

  /** Register a new staff account */
  const register = async (email: string, password: string, fullName: string): Promise<boolean> => {
    try {
      const resp = await fetch(`${API_BASE}/staff/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName, role: "manager" }),
      });
      if (!resp.ok) {
        const err = await resp.json();
        toast.error(err.detail || "Registration failed");
        return false;
      }
      toast.success("Account created! Please sign in.");
      return true;
    } catch {
      toast.error("Connection error");
      return false;
    }
  };

  const signOut = async () => {
    localStorage.removeItem("manager_token");
    setToken(null);
    setUser(null);
    toast.info("Logged out");
  };

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role || null,
      displayName: user?.full_name || null,
      loading,
      login,
      register,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
