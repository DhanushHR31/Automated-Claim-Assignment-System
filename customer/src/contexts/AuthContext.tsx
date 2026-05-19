import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthContextType {
  user: { id: string; email: string } | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (token: string, userData: any) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  signIn: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("customer_token");
      if (token) {
        try {
          const res = await fetch("http://localhost:8000/me", {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
          } else {
            localStorage.removeItem("customer_token");
          }
        } catch (e) {
          localStorage.removeItem("customer_token");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const signOut = async () => {
    localStorage.removeItem("customer_token");
    setUser(null);
    window.location.href = "/";
  };

  const signIn = (token: string, userData: any) => {
    localStorage.setItem("customer_token", token);
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}
