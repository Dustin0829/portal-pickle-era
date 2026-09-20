import "@testing-library/jest-dom/vitest";
import "../bones/registry";
import { afterEach, vi } from "vitest";
import { queryClient } from "@/providers/QueryProvider";
import { fallbackFacilitySettings } from "@/lib/facility/facilitySettingsView";

vi.mock("@/api/features/facility-settings/facility-settings.service", () => ({
  getFacilitySettings: vi.fn(async () => fallbackFacilitySettings()),
  patchFacilitySettings: vi.fn(async () => fallbackFacilitySettings()),
}));

afterEach(async () => {
  await queryClient.cancelQueries();
  queryClient.clear();
});

// Base UI / Radix primitives expect pointer capture in jsdom.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
if (!HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = () => {};
}
window.scrollTo = vi.fn();

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: ResizeObserverMock,
});
