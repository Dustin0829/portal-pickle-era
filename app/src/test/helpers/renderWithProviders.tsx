import React from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import { BookingModalProvider } from "@/providers/BookingModalProvider";
import { JoinClubModalProvider } from "@/providers/JoinClubModalProvider";

export function renderWithProviders(
  ui: React.ReactElement,
  options?: { route?: string; renderOptions?: Omit<RenderOptions, "wrapper"> },
) {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  const route = options?.route ?? "/";

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={[route]}>
          <AuthProvider>
            <BookingModalProvider>
              <JoinClubModalProvider>{children}</JoinClubModalProvider>
            </BookingModalProvider>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  return {
    qc,
    Wrapper,
    ...render(ui, { wrapper: Wrapper, ...options?.renderOptions }),
  };
}
