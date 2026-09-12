import { create } from "zustand";

type RateLimitedState = {
  blocked: boolean;
  markBlocked: () => void;
  clearBlocked: () => void;
};

export const useRateLimitedStore = create<RateLimitedState>((set, get) => ({
  blocked: false,
  markBlocked: () => {
    if (get().blocked) return;
    set({ blocked: true });
  },
  clearBlocked: () => set({ blocked: false }),
}));
