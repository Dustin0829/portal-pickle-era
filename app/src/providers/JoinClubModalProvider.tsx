import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { JoinClubModal } from "@/components/marketing/JoinClubModal";

type JoinClubModalContextValue = {
  openJoinClubModal: () => void;
};

const JoinClubModalContext = createContext<JoinClubModalContextValue | null>(
  null,
);

export function JoinClubModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openJoinClubModal = useCallback(() => setOpen(true), []);
  const closeJoinClubModal = useCallback(() => setOpen(false), []);

  return (
    <JoinClubModalContext.Provider value={{ openJoinClubModal }}>
      {children}
      {open ? <JoinClubModal onClose={closeJoinClubModal} /> : null}
    </JoinClubModalContext.Provider>
  );
}

export function useJoinClubModal() {
  const context = useContext(JoinClubModalContext);
  if (!context) {
    throw new Error("useJoinClubModal must be used within JoinClubModalProvider");
  }
  return context;
}
