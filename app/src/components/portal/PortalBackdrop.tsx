type PortalBackdropProps = {
  /** `bottom` = overview/bookings; `top` = calendar header treatment */
  variant?: "bottom" | "top";
};

/** Shared decorative ball + watermark for portal pages (light content). */
export function PortalBackdrop({ variant = "bottom" }: PortalBackdropProps) {
  if (variant === "top") {
    return (
      <>
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <div
            className="absolute -right-[2%] -top-[6%] h-[min(52vh,480px)] w-[min(82vw,640px)] opacity-80"
            style={{
              maskImage:
                "radial-gradient(ellipse 75% 70% at 70% 30%, black 0%, black 42%, transparent 82%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 75% 70% at 70% 30%, black 0%, black 42%, transparent 82%)",
            }}
          >
            <img
              src="/footer-ball.jpg"
              alt=""
              className="h-full w-full scale-110 object-cover object-[70%_40%]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#f3f4f6]/35 to-[#f3f4f6]/90" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#f3f4f6]/55 via-transparent to-[#f3f4f6]/75" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div
          className="absolute -bottom-[4%] -right-[2%] h-[min(78vh,720px)] w-[min(95vw,780px)] opacity-85 sm:opacity-90"
          style={{
            maskImage:
              "radial-gradient(ellipse 78% 72% at 68% 75%, black 0%, black 48%, transparent 84%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 78% 72% at 68% 75%, black 0%, black 48%, transparent 84%)",
          }}
        >
          <img
            src="/footer-ball.jpg"
            alt=""
            className="h-full w-full scale-110 object-cover object-[68%_55%]"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#f3f4f6] via-[#f3f4f6]/55 to-transparent to-55%" />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-[#f3f4f6]/70" />
      </div>
    </>
  );
}
