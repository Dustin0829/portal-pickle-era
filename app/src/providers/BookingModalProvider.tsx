import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { BookingModal } from "@/components/marketing/BookingModal";
import type { BookingPlan } from "@/lib/booking/booking";

type BookingModalContextValue = {
  openBookingModal: (plan: BookingPlan) => void;
};

const BookingModalContext = createContext<BookingModalContextValue | null>(
  null,
);

export function BookingModalProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<BookingPlan | null>(null);

  const openBookingModal = useCallback(
    (next: BookingPlan) => setPlan(next),
    [],
  );
  const closeBookingModal = useCallback(() => setPlan(null), []);

  return (
    <BookingModalContext.Provider value={{ openBookingModal }}>
      {children}
      {plan !== null ? (
        <BookingModal key={plan} plan={plan} onClose={closeBookingModal} />
      ) : null}
    </BookingModalContext.Provider>
  );
}

export function useBookingModal() {
  const context = useContext(BookingModalContext);
  if (!context) {
    throw new Error("useBookingModal must be used within BookingModalProvider");
  }
  return context;
}
