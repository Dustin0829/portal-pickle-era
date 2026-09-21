import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Home } from "lucide-react";
import { PortalChrome } from "@/components/portal/PortalChrome";
import * as AuthProvider from "@/providers/AuthProvider";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

vi.mock("@/api/features/auth/auth.service", () => ({
  getMe: vi.fn(async () => {
    const err = new Error("Unauthorized") as Error & { statusCode: number };
    err.statusCode = 401;
    throw err;
  }),
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
  refreshUser: vi.fn(),
  patchMe: vi.fn(),
}));

function mockUser(name: string, email: string) {
  vi.spyOn(AuthProvider, "useAuth").mockReturnValue({
    user: { id: "u1", name, email, role: "student" },
    status: "authenticated",
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
    resetPassword: vi.fn(),
  });
}

function renderChrome() {
  return renderWithProviders(
    <PortalChrome
      title="Player portal"
      items={[{ to: "/app", label: "Overview", end: true, icon: Home }]}
      homeTo="/app"
    >
      <p>Portal body</p>
    </PortalChrome>,
    { route: "/app" },
  );
}

describe("PortalChrome identity block", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows initials, name, and email for the signed-in user", () => {
    mockUser("Maria Santos", "maria@example.com");
    renderChrome();

    expect(screen.getAllByText("MS").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Maria Santos").length).toBeGreaterThan(0);
    expect(screen.getAllByText("maria@example.com").length).toBeGreaterThan(0);
  });

  it("derives initials from a single-word name", () => {
    mockUser("Pickle", "pickle@example.com");
    renderChrome();

    expect(screen.getAllByText("PI").length).toBeGreaterThan(0);
  });

  it("keeps a reachable log out control", () => {
    mockUser("Maria Santos", "maria@example.com");
    renderChrome();

    expect(
      screen.getAllByRole("button", { name: /log out/i }).length,
    ).toBeGreaterThan(0);
  });
});
