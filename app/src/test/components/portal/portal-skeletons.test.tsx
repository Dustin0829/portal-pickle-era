import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  PortalListSkeleton,
  PortalStatSkeleton,
} from "@/components/portal/portal-skeletons";

describe("portal skeletons", () => {
  it("exposes busy labels for list and stats", () => {
    render(
      <>
        <PortalStatSkeleton />
        <PortalListSkeleton />
      </>,
    );
    expect(screen.getByLabelText("Loading stats")).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.getByLabelText("Loading list")).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });
});
