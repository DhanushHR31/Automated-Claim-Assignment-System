import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { apiClient } from "@/services/apiClient";

interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: "admin" | "manager" | "agent";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ManagerProfile {
  full_name: string;
  employee_id?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  managerProfile: ManagerProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (email: string, username: string, full_name: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  managerProfile: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [managerProfile, setManagerProfile] = useState<ManagerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (apiClient.isAuthenticated()) {
          // Try to fetch current user data
          const userData = await apiClient.get<User>("/users/me");
          setUser(userData);
          // Set manager profile from user data
          setManagerProfile({
            full_name: userData.full_name,
            employee_id: `EMP-${userData.id}`,
          });
        }
      } catch (err) {
        // Token might be invalid, clear it
        apiClient.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      setError(null);
      const response = await apiClient.login(username, password);
      setUser(response.user);
      // Set manager profile from user data
      setManagerProfile({
        full_name: response.user.full_name,
        employee_id: `EMP-${response.user.id}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const register = useCallback(async (email: string, username: string, full_name: string, password: string) => {
    try {
      setError(null);
      await apiClient.register(email, username, full_name, password);
      // After registration, auto-login
      await login(username, password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
      throw err;
    }
  }, [login]);

  const logout = useCallback(() => {
    apiClient.logout();
    setUser(null);
    setManagerProfile(null);
    setError(null);
    // Redirect to login page by reloading the window
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        managerProfile,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
