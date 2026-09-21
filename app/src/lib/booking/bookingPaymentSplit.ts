/** Display math for booking detail payment split (pesos total + applied credits). */
export function bookingPaymentSplit(input: {
  totalPesos: number;
  walletAppliedCents?: number | null;
}): {
  totalCents: number;
  walletAppliedCents: number;
  remainingCashCents: number;
  isSplit: boolean;
} {
  const totalCents = Math.max(0, Math.round(input.totalPesos * 100));
  const raw = Math.max(0, Math.floor(input.walletAppliedCents ?? 0));
  const walletAppliedCents = Math.min(raw, totalCents);
  return {
    totalCents,
    walletAppliedCents,
    remainingCashCents: totalCents - walletAppliedCents,
    isSplit: walletAppliedCents > 0,
  };
}
