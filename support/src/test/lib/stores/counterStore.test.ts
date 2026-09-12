import { beforeEach, describe, expect, it } from "vitest";
import { useCounterStore } from "@/lib/stores/counterStore";

describe("useCounterStore", () => {
  beforeEach(() => {
    useCounterStore.setState({ count: 0 });
  });

  it("increments and decrements", () => {
    expect(useCounterStore.getState().count).toBe(0);
    useCounterStore.getState().increment();
    useCounterStore.getState().increment();
    expect(useCounterStore.getState().count).toBe(2);
    useCounterStore.getState().decrement();
    expect(useCounterStore.getState().count).toBe(1);
  });

  it("resets", () => {
    useCounterStore.setState({ count: 5 });
    useCounterStore.getState().reset();
    expect(useCounterStore.getState().count).toBe(0);
  });
});
