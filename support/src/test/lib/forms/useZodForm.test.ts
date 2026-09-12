import { describe, expect, it } from "vitest";
import { useZodForm } from "@/lib/forms/useZodForm";
import { z } from "zod";
import { renderHook } from "@testing-library/react";

const schema = z.object({ name: z.string().min(1) });

describe("useZodForm", () => {
  it("initializes with default values", () => {
    const { result } = renderHook(() =>
      useZodForm(schema, { defaultValues: { name: "Acme" } }),
    );
    expect(result.current.getValues("name")).toBe("Acme");
  });
});
