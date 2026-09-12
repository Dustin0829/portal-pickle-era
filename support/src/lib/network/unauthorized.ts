import { create } from "zustand";

type UnauthorizedState = {
  blocked: boolean;
  markUnauthorized: () => void;
  clearUnauthorized: () => void;
};

export const useUnauthorizedStore = create<UnauthorizedState>((set, get) => ({
  blocked: false,
  markUnauthorized: () => {
    if (get().blocked) return;
    set({ blocked: true });
  },
  clearUnauthorized: () => set({ blocked: false }),
}));
