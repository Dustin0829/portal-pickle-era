import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { useBookingModal } from "@/providers/BookingModalProvider";
import { useJoinClubModal } from "@/providers/JoinClubModalProvider";
import type { BookingPlan } from "@/lib/booking/booking";
import { useFacilitySettingsStore } from "@/lib/stores/facilitySettingsStore";

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
  const { openJoinClubModal } = useJoinClubModal();
  const preSignup = useFacilitySettingsStore((state) => state.preSignup);

  return (
    <button
      type="button"
      className={className}
      onClick={(event) => {
        if (preSignup) {
          openJoinClubModal();
        } else {
          openBookingModal(plan);
        }
        onClick?.(event);
      }}
      {...props}
    >
      {preSignup ? "Join the club" : children}
    </button>
  );
}
