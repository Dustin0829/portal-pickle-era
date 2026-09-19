import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { BookingModal } from "@/components/marketing/BookingModal";
import type { BookablePlan, BookingPlan } from "@/lib/booking/booking";
import { preferFromOpenArg } from "@/lib/booking/unifiedBookingSelection";

export type BookingModalPreset = {
  date: string;
  courtId: string;
  slotIds: string[];
  step?: "schedule" | "pay";
};

type BookingModalSession = {
  prefer?: BookablePlan;
  preset?: BookingModalPreset;
};

type BookingModalContextValue = {
  openBookingModal: (
    plan?: BookablePlan | BookingPlan,
    preset?: BookingModalPreset,
  ) => void;
};

const BookingModalContext = createContext<BookingModalContextValue | null>(
  null,
);

export function BookingModalProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<BookingModalSession | null>(null);

  const openBookingModal = useCallback(
    (plan?: BookablePlan | BookingPlan, preset?: BookingModalPreset) => {
      setSession({ prefer: preferFromOpenArg(plan), preset });
    },
    [],
  );
  const closeBookingModal = useCallback(() => setSession(null), []);

  return (
    <BookingModalContext.Provider value={{ openBookingModal }}>
      {children}
      {session !== null ? (
        <BookingModal
          key={`${session.prefer ?? "any"}-${session.preset?.date ?? ""}-${session.preset?.courtId ?? ""}-${session.preset?.slotIds?.join(",") ?? ""}`}
          prefer={session.prefer}
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
