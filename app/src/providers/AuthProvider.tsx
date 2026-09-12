import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getSession,
  loginAccount,
  logoutAccount,
  resetAccountPassword,
  signupAccount,
  type AuthUser,
} from "@/lib/auth/auth";

type AuthContextValue = {
  user: AuthUser | null;
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
  const [user, setUser] = useState<AuthUser | null>(() => getSession());

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      const next = await loginAccount(input);
      setUser(next);
      return next;
    },
    [],
  );

  const signup = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      const next = await signupAccount(input);
      setUser(next);
      return next;
    },
    [],
  );

  const logout = useCallback(() => {
    logoutAccount();
    setUser(null);
  }, []);

  const resetPassword = useCallback(
    async (input: { email: string; password: string }) => {
      await resetAccountPassword(input);
    },
    [],
  );

  const value = useMemo(
    () => ({ user, login, signup, logout, resetPassword }),
    [user, login, signup, logout, resetPassword],
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
