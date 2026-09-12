import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { useBookingModal } from "@/providers/BookingModalProvider";
import type { BookingPlan } from "@/lib/booking/booking";

type BookingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  plan: BookingPlan;
  children?: ReactNode;
};

export function BookingButton({
  plan,
  children,
  className,
  onClick,
  ...props
}: BookingButtonProps) {
  const { openBookingModal } = useBookingModal();

  return (
    <button
      type="button"
      className={className}
      onClick={(event) => {
        openBookingModal(plan);
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
