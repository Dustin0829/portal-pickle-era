import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ensureAdminFixture,
  getSession,
  loginAccount,
  logoutAccount,
  resetAccountPassword,
  signupAccount,
  type AuthUser,
} from "@/lib/auth/auth";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  login: (input: { email: string; password: string }) => Promise<AuthUser>;
  signup: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<AuthUser>;
  logout: () => void;
  resetPassword: (input: { email: string; password: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await ensureAdminFixture();
      if (cancelled) return;
      const session = getSession();
      setUser(session);
      setStatus(session ? "authenticated" : "unauthenticated");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      const next = await loginAccount(input);
      setUser(next);
      setStatus("authenticated");
      return next;
    },
    [],
  );

  const signup = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      const next = await signupAccount(input);
      setUser(next);
      setStatus("authenticated");
      return next;
    },
    [],
  );

  const logout = useCallback(() => {
    logoutAccount();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const resetPassword = useCallback(
    async (input: { email: string; password: string }) => {
      await resetAccountPassword(input);
    },
    [],
  );

  const value = useMemo(
    () => ({ user, status, login, signup, logout, resetPassword }),
    [user, status, login, signup, logout, resetPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
