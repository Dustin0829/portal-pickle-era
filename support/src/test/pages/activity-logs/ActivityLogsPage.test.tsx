import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiRequestError } from "@/api/client";
import { ActivityLogsPage } from "@/pages/activity-logs/ActivityLogsPage";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

const mockUseActivityLogsList = vi.fn();
const mockUseActivityLogDetail = vi.fn();

vi.mock("@/api/features/activity-logs/use-activity-logs", () => ({
  useActivityLogsList: () => mockUseActivityLogsList(),
  useActivityLogDetail: () => mockUseActivityLogDetail(),
}));

describe("ActivityLogsPage", () => {
  it("shows empty state when there are no rows", () => {
    mockUseActivityLogsList.mockReturnValue({
      data: { items: [], meta: { total_pages: 1 } },
      isPending: false,
      isError: false,
      error: null,
    });
    mockUseActivityLogDetail.mockReturnValue({
      data: undefined,
      isPending: false,
    });

    renderWithProviders(<ActivityLogsPage />);
    expect(screen.getByText("No activity in this range.")).toBeInTheDocument();
  });

  it("shows unavailable state on ACTIVITY_LOGS_UNAVAILABLE", () => {
    mockUseActivityLogsList.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      error: new ApiRequestError("down", 503, "ACTIVITY_LOGS_UNAVAILABLE"),
    });
    mockUseActivityLogDetail.mockReturnValue({
      data: undefined,
      isPending: false,
    });

    renderWithProviders(<ActivityLogsPage />);
    expect(
      screen.getByText(/Activity log store is unavailable/),
    ).toBeInTheDocument();
  });
});
