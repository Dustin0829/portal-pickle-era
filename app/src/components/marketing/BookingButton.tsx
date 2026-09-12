import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { useJoinClubModal } from "@/providers/JoinClubModalProvider";
import type { BookingPlan } from "@/lib/booking/booking";

type BookingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Kept for call-site compatibility; marketing CTAs open Join the club for now. */
  plan?: BookingPlan;
  children?: ReactNode;
};

/** Marketing CTAs — currently all open Join the club (pre-signup). */
export function BookingButton({
  plan: _ignoredPlan,
  children: _ignoredChildren,
  className,
  onClick,
  ...props
}: BookingButtonProps) {
  void _ignoredPlan;
  void _ignoredChildren;
  const { openJoinClubModal } = useJoinClubModal();

  return (
    <button
      type="button"
      className={className}
      onClick={(event) => {
        openJoinClubModal();
        onClick?.(event);
      }}
      {...props}
    >
      Join the club
    </button>
  );
}
