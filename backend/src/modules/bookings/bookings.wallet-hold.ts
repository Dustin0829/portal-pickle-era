/** Pure guards for booking wallet hold / refund / legacy approve. */

export function bookingRejectNeedsRefund(input: {
  hasPriorDebit: boolean;
  hasPriorRefund: boolean;
  walletAppliedCents: number;
}): boolean {
  return input.hasPriorDebit && !input.hasPriorRefund && input.walletAppliedCents > 0;
}

export function bookingApproveNeedsDebit(input: {
  hasPriorDebit: boolean;
  walletAppliedCents: number;
}): boolean {
  return input.walletAppliedCents > 0 && !input.hasPriorDebit;
}
