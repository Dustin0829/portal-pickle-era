import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomePage } from "@/pages/home/HomePage";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

const mockUseExamplesList = vi.fn();
const mockUseCreateExample = vi.fn();

vi.mock("@/api/features/examples/use-examples", () => ({
  useExamplesList: () => mockUseExamplesList(),
  useCreateExample: () => mockUseCreateExample(),
}));

function renderHome() {
  return renderWithProviders(
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <HomePage />
    </ThemeProvider>,
  );
}

describe("HomePage", () => {
  it("renders examples list when ready", () => {
    mockUseExamplesList.mockReturnValue({
      data: {
        items: [
          {
            id: "ex-1",
            label: "Demo label",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        ],
      },
      isPending: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
      error: null,
    });
    mockUseCreateExample.mockReturnValue({
      createExample: vi.fn(),
      isCreatingExample: false,
      createSucceeded: false,
    });

    renderHome();

    expect(screen.getByRole("heading", { name: "App" })).toBeInTheDocument();
    expect(screen.getByText("Demo label")).toBeInTheDocument();
  });

  it("renders loading skeleton for examples", () => {
    mockUseExamplesList.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
      error: null,
    });
    mockUseCreateExample.mockReturnValue({
      createExample: vi.fn(),
      isCreatingExample: false,
      createSucceeded: false,
    });

    renderHome();

    expect(screen.getByLabelText("Loading examples")).toBeInTheDocument();
  });

  it("renders error state with retry", () => {
    mockUseExamplesList.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      isFetching: false,
      refetch: vi.fn(),
      error: new Error("Network error"),
    });
    mockUseCreateExample.mockReturnValue({
      createExample: vi.fn(),
      isCreatingExample: false,
      createSucceeded: false,
    });

    renderHome();

    expect(screen.getByText("Couldn't load examples")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});
