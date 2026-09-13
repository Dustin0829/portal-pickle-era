import { type ButtonHTMLAttributes, type ReactNode } from "react";
import type { BookingPlan } from "@/lib/booking/booking";
import { useBookingModal } from "@/providers/BookingModalProvider";

type BookingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  plan?: BookingPlan;
  children?: ReactNode;
};

/** Marketing CTAs — opens the court booking modal (advance booking). */
export function BookingButton({
  plan = "court",
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
      {children ?? "Book a court"}
    </button>
  );
}
