import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppPageShell, PageHeader, PageSection } from "@/components/layout";

describe("AppPageShell", () => {
  it("renders children with page title", () => {
    render(
      <AppPageShell>
        <PageHeader title="Overview" description="Workspace summary" />
        <PageSection bordered>
          <p>Workspace</p>
        </PageSection>
      </AppPageShell>,
    );

    expect(
      screen.getByRole("heading", { name: "Overview" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Workspace summary")).toBeInTheDocument();
    expect(screen.getByText("Workspace")).toBeInTheDocument();
  });
});
