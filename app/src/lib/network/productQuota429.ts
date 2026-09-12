/** Product-quota 429s stay in-flow and must not trip RateLimitGate. Empty in the template. */
export const PRODUCT_QUOTA_429_CODES: readonly string[] = [];

const PRODUCT_QUOTA_429_CODE_SET = new Set<string>(PRODUCT_QUOTA_429_CODES);

export function isProductQuota429Code(code: string | undefined): boolean {
  return Boolean(code && PRODUCT_QUOTA_429_CODE_SET.has(code));
}

export function shouldMarkRateLimitedOn429(code: string | undefined): boolean {
  return !isProductQuota429Code(code);
}
