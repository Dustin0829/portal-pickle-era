import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RateLimitGate } from "@/providers/RateLimitGate";
import { useRateLimitedStore } from "@/lib/network/rateLimited";

describe("RateLimitGate", () => {
  it("shows recovery UI when blocked and retry clears it", async () => {
    useRateLimitedStore.setState({ blocked: true });

    render(
      <RateLimitGate>
        <p>App content</p>
      </RateLimitGate>,
    );

    expect(
      screen.getByRole("heading", { name: "Too many requests" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("App content")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.getByText("App content")).toBeInTheDocument();
    expect(useRateLimitedStore.getState().blocked).toBe(false);
  });
});
