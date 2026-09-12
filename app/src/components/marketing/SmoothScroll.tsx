import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

const NAV_OFFSET = -84;

export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        lerp: 0.055,
        duration: 1.45,
        wheelMultiplier: 0.72,
        touchMultiplier: 1,
        smoothWheel: true,
        syncTouch: false,
        anchors: {
          offset: NAV_OFFSET,
          duration: 1.45,
          lerp: 0.055,
        },
        stopInertiaOnNavigate: true,
        respectReducedMotion: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
