/** Pure wallet apply math for portal booking (pesos total → cents). */
export function walletAppliedAndRemaining(input: {
  balanceCents: number;
  totalPesos: number;
}): {
  totalCents: number;
  walletAppliedCents: number;
  remainingCashCents: number;
} {
  const totalCents = Math.max(0, Math.round(input.totalPesos * 100));
  const balance = Math.max(0, Math.floor(input.balanceCents));
  const walletAppliedCents = Math.min(balance, totalCents);
  return {
    totalCents,
    walletAppliedCents,
    remainingCashCents: totalCents - walletAppliedCents,
  };
}
