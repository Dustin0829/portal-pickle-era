import type { FoodOrderStatus } from "@/api/features/food/food.schema";

/** Shared status labels for Food tab + activity feeds. */
export function foodOrderStatusLabel(status: FoodOrderStatus): string {
  if (status === "pending") return "Queued";
  if (status === "preparing") return "Preparing";
  return "Ready";
}
