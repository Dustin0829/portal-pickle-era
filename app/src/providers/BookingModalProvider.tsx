import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { BookingModal } from "@/components/marketing/BookingModal";
import type { BookingPlan } from "@/lib/booking/booking";

export type BookingModalPreset = {
  date: string;
  courtId: string;
  slotIds: string[];
  step?: "schedule" | "pay";
};

type BookingModalSession = {
  plan: BookingPlan;
  preset?: BookingModalPreset;
};

type BookingModalContextValue = {
  openBookingModal: (
    plan: BookingPlan,
    preset?: BookingModalPreset,
  ) => void;
};

const BookingModalContext = createContext<BookingModalContextValue | null>(
  null,
);

export function BookingModalProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<BookingModalSession | null>(null);

  const openBookingModal = useCallback(
    (plan: BookingPlan, preset?: BookingModalPreset) => {
      setSession({ plan, preset });
    },
    [],
  );
  const closeBookingModal = useCallback(() => setSession(null), []);

  return (
    <BookingModalContext.Provider value={{ openBookingModal }}>
      {children}
      {session !== null ? (
        <BookingModal
          key={`${session.plan}-${session.preset?.date ?? ""}-${session.preset?.courtId ?? ""}-${session.preset?.slotIds?.join(",") ?? ""}`}
          plan={session.plan}
          preset={session.preset}
          onClose={closeBookingModal}
        />
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
