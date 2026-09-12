import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageSectionProps = {
  children: ReactNode;
  bordered?: boolean;
  className?: string;
};

export function PageSection({
  children,
  bordered = false,
  className,
}: PageSectionProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4",
        bordered && "border-t border-border pt-8",
        className,
      )}
    >
      {children}
    </section>
  );
}
