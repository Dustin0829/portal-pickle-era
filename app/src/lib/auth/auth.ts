export type AuthRole = "student" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
};

type StoredUser = AuthUser & {
  passwordHash: string;
  createdAt: string;
};

const USERS_KEY = "pickle-era-users";
const SESSION_KEY = "pickle-era-session";

/** Demo admin for local portal gates — UX only, not real security. */
export const ADMIN_FIXTURE = {
  name: "Facility Admin",
  email: "admin@pickleera.local",
  password: "password1",
} as const;

async function hashPassword(password: string) {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function listUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]") as StoredUser[];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function normalizeUser(user: StoredUser): StoredUser {
  return {
    ...user,
    role: user.role === "admin" ? "admin" : "student",
  };
}

function toPublicUser(user: StoredUser): AuthUser {
  const normalized = normalizeUser(user);
  return {
    id: normalized.id,
    name: normalized.name,
    email: normalized.email,
    role: normalized.role,
  };
}

export function getSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    return {
      ...parsed,
      role: parsed.role === "admin" ? "admin" : "student",
    };
  } catch {
    return null;
  }
}

function setSession(user: AuthUser | null) {
  if (!user) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

/** Ensures a local admin account exists for demo (password: password1). */
export async function ensureAdminFixture() {
  const users = listUsers().map(normalizeUser);
  const email = ADMIN_FIXTURE.email;
  if (users.some((user) => user.email === email)) {
    saveUsers(users);
    return;
  }

  const admin: StoredUser = {
    id: crypto.randomUUID(),
    name: ADMIN_FIXTURE.name,
    email,
    role: "admin",
    passwordHash: await hashPassword(ADMIN_FIXTURE.password),
    createdAt: new Date().toISOString(),
  };
  saveUsers([...users, admin]);
}

export async function signupAccount(input: {
  name: string;
  email: string;
  password: string;
}) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  if (!name || !email || input.password.length < 8) {
    throw new Error(
      "Enter your name, email, and a password with at least 8 characters.",
    );
  }

  const users = listUsers().map(normalizeUser);
  if (users.some((user) => user.email === email)) {
    throw new Error("An account with that email already exists.");
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    name,
    email,
    role: "student",
    passwordHash: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };

  saveUsers([...users, user]);
  const session = toPublicUser(user);
  setSession(session);
  return session;
}

export async function loginAccount(input: { email: string; password: string }) {
  await ensureAdminFixture();
  const email = input.email.trim().toLowerCase();
  const user = listUsers()
    .map(normalizeUser)
    .find((item) => item.email === email);
  const passwordHash = await hashPassword(input.password);

  if (!user || user.passwordHash !== passwordHash) {
    throw new Error("Email or password is incorrect.");
  }

  const session = toPublicUser(user);
  setSession(session);
  return session;
}

export function logoutAccount() {
  setSession(null);
}

export async function resetAccountPassword(input: {
  email: string;
  password: string;
}) {
  const email = input.email.trim().toLowerCase();
  if (input.password.length < 8) {
    throw new Error("Use a password with at least 8 characters.");
  }

  const users = listUsers().map(normalizeUser);
  const index = users.findIndex((user) => user.email === email);
  if (index === -1) {
    throw new Error(
      "We could not reset that password. Check the email and try again.",
    );
  }

  users[index] = {
    ...users[index],
    passwordHash: await hashPassword(input.password),
  };
  saveUsers(users);
}
