import type { Example } from "@/api/features/examples/examples.schema";

export type ExampleListStatus = "loading" | "error" | "empty" | "ready";

export function getExampleListStatus({
  isPending,
  isError,
  items,
}: {
  isPending: boolean;
  isError: boolean;
  items: Example[] | undefined;
}): ExampleListStatus {
  if (isPending) return "loading";
  if (isError) return "error";
  if (!items?.length) return "empty";
  return "ready";
}
