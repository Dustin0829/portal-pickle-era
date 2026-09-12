import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UnauthorizedGate } from "@/providers/UnauthorizedGate";
import { useUnauthorizedStore } from "@/lib/network/unauthorized";

describe("UnauthorizedGate", () => {
  it("shows the 401 page when blocked and retry recovers", () => {
    useUnauthorizedStore.setState({ blocked: true });

    render(
      <UnauthorizedGate>
        <p>Support content</p>
      </UnauthorizedGate>,
    );

    expect(
      screen.getByRole("heading", { name: "Sign in required" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Support content")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.getByText("Support content")).toBeInTheDocument();
    expect(useUnauthorizedStore.getState().blocked).toBe(false);
  });
});
