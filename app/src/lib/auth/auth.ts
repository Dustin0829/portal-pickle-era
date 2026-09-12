export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type StoredUser = AuthUser & {
  passwordHash: string;
  createdAt: string;
};

const USERS_KEY = "pickle-era-users";
const SESSION_KEY = "pickle-era-session";

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

function toPublicUser(user: StoredUser): AuthUser {
  return { id: user.id, name: user.name, email: user.email };
}

export function getSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
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

  const users = listUsers();
  if (users.some((user) => user.email === email)) {
    throw new Error("An account with that email already exists.");
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };

  saveUsers([...users, user]);
  const session = toPublicUser(user);
  setSession(session);
  return session;
}

export async function loginAccount(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const user = listUsers().find((item) => item.email === email);
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

  const users = listUsers();
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
