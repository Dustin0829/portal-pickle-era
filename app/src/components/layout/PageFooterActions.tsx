import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageFooterActionsProps = {
  children: ReactNode;
  className?: string;
};

/** Sticky save / primary actions — full-width on mobile, row on desktop. */
export function PageFooterActions({
  children,
  className,
}: PageFooterActionsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end",
        className,
      )}
    >
      {children}
    </div>
  );
}
