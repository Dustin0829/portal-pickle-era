/** Shared horizontal padding — align app chrome with AppPageShell. */
export const appContentPaddingClass = "px-4 sm:px-6";

export const appContentWidthClass = {
  /** Comfortable reading width for typical app content (lists, detail, settings). */
  default: "max-w-3xl",
  /** Focused forms and narrow editorial content. */
  profile: "max-w-2xl",
  /** Compact flows (auth card, narrow panels). */
  narrow: "max-w-lg",
  /** Full content width — marketing sections, wide dashboards; no max-width cap. */
  full: "max-w-none",
} as const;

export type AppPageShellWidth = keyof typeof appContentWidthClass;
