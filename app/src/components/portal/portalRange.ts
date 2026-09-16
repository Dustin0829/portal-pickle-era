export type PortalRangeValue = "today" | "7d" | "30d" | "90d" | "all";

export const PORTAL_RANGE_OPTIONS: Array<{
  value: PortalRangeValue;
  label: string;
}> = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];
