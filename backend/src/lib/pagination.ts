import type { PaginationMeta } from "./api-response.js";

export function pageToOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  totalItems: number,
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return {
    page,
    current_page: page,
    limit,
    items_per_page: limit,
    total: totalItems,
    total_items: totalItems,
    total_pages: totalPages,
  };
}

export function parseSortField<T extends string>(
  sort: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  if (!sort) return fallback;
  return allowed.includes(sort as T) ? (sort as T) : fallback;
}
