/** When the backend wraps payloads as `{ success, message, data }`. */
export type ApiSuccess<T> = {
  success: boolean;
  message?: string;
  data: T;
  meta?: PaginationMeta;
};

export type ApiErrorBody = {
  success?: false;
  message?: string;
  error?: string;
  code?: string;
  errors?: unknown;
};

/** Paginated list metadata — aligns with `paginationMetaSchema` in primitives.schema.ts */
export type PaginationMeta = {
  page: number;
  current_page: number;
  limit: number;
  items_per_page: number;
  total: number;
  total_items: number;
  total_pages: number;
};
