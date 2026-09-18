/** Convert pesos (UI) to integer cents for the API. */
export function pesosToCents(pesos: number): number {
  return Math.round(pesos * 100);
}

/** Convert cents to pesos for display. */
export function centsToPesos(cents: number): number {
  return cents / 100;
}

/** Format cents as ₱ display string (en-PH). */
export function formatCentsAsPesos(cents: number): string {
  return `₱${centsToPesos(cents).toLocaleString("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}
