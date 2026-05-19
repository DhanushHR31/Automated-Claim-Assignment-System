import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi, type TokenResponse } from "./api";

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  session: AuthUser | null; // alias for compatibility
  loading: boolean;
  signOut: () => void;
  signIn: (email: string, password: string) => Promise<TokenResponse>;
  signUp: (email: string, password: string, hospitalName: string) => Promise<TokenResponse>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem("mediclaim_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser);
  const [loading, setLoading] = useState(false);

  const persist = (res: TokenResponse) => {
    localStorage.setItem("mediclaim_token", res.access_token);
    const u = { id: res.user_id, email: res.email };
    localStorage.setItem("mediclaim_user", JSON.stringify(u));
    setUser(u);
    return res;
  };

  const signIn = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    return persist(res);
  };

  const signUp = async (email: string, password: string, hospitalName: string) => {
    const res = await authApi.register(email, password, hospitalName);
    return persist(res);
  };

  const signOut = () => {
    localStorage.removeItem("mediclaim_token");
    localStorage.removeItem("mediclaim_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, session: user, loading, signOut, signIn, signUp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
