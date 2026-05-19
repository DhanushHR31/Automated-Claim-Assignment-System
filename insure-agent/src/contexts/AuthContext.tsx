import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  email: string;
  avatar_url: string;
  is_online: boolean;
  current_lat: number | null;
  current_lng: number | null;
  city: string;
  district: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { name: string; email: string; password: string; phone: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = "http://localhost:8000";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem("agent_token"));

  const fetchProfile = async (userId: string) => {
    try {
      const resp = await fetch(`${API_BASE}/profiles/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    }
  };

  const checkAuth = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const resp = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        const userData = await resp.json();
        setUser(userData);
        await fetchProfile(userData.id);
      } else {
        localStorage.removeItem("agent_token");
        setToken(null);
      }
    } catch (err) {
      console.error("Auth check error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [token]);

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
      localStorage.setItem("agent_token", data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      await fetchProfile(data.user.id);
      toast.success("Welcome back!");
      return true;
    } catch (err) {
      toast.error("Connection error");
      return false;
    }
  };

  const register = async (data: { name: string; email: string; password: string; phone: string }): Promise<boolean> => {
    try {
      const resp = await fetch(`${API_BASE}/staff/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          full_name: data.name,
          phone: data.phone,
          role: "agent"
        }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        toast.error(err.detail || "Registration failed");
        return false;
      }

      toast.success("Account created successfully!");
      return true;
    } catch (err) {
      toast.error("Connection error");
      return false;
    }
  };

  const logout = async () => {
    localStorage.removeItem("agent_token");
    setToken(null);
    setUser(null);
    setProfile(null);
    toast.info("Logged out");
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !token) return;
    try {
      const resp = await fetch(`${API_BASE}/profiles/${user.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates),
      });
      if (!resp.ok) throw new Error("Update failed");
      
      const data = await resp.json();
      setProfile(data as Profile);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{
      user: user as any, profile, isAuthenticated: !!user, loading,
      login, register, logout, updateProfile, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
