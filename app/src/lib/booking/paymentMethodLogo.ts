/** Static brand marks for common PH payment labels (transparent PNGs). */
const LOGO_BY_KEY: Record<string, string> = {
  gcash: "/payment-logos/gcash.png",
  maya: "/payment-logos/maya.png",
  paymaya: "/payment-logos/maya.png",
  bdo: "/payment-logos/bdo.png",
  bpi: "/payment-logos/bpi.png",
};

/** Resolve a local transparent logo path from a method label, or null if unknown. */
export function paymentMethodLogoSrc(label: string): string | null {
  const key = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  if (!key) return null;
  if (LOGO_BY_KEY[key]) return LOGO_BY_KEY[key]!;
  for (const [token, src] of Object.entries(LOGO_BY_KEY)) {
    if (key.includes(token) || token.includes(key)) return src;
  }
  return null;
}
