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
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  signup as signupRequest,
} from "@/api/features/auth/auth.service";
import type { AuthUser } from "@/api/features/auth/auth.types";

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
  logout: () => Promise<void>;
  resetPassword: (input: { email: string; password: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    void (async () => {
      try {
        const session = await getMe(controller.signal);
        if (cancelled) return;
        setUser(session);
        setStatus("authenticated");
      } catch {
        if (cancelled || controller.signal.aborted) return;
        setUser(null);
        setStatus("unauthenticated");
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      const next = await loginRequest(input);
      setUser(next);
      setStatus("authenticated");
      return next;
    },
    [],
  );

  const signup = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      const next = await signupRequest(input);
      setUser(next);
      setStatus("authenticated");
      return next;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Clear local session even if the API call fails.
    }
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const resetPassword = useCallback(
    async (_input: { email: string; password: string }) => {
      void _input;
      throw new Error(
        "Password reset is not available yet. Contact the facility.",
      );
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
