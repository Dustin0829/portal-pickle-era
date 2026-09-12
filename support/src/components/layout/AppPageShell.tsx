import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  appContentPaddingClass,
  appContentWidthClass,
  type AppPageShellWidth,
} from "./layout.constants";

type AppPageShellProps = {
  children: ReactNode;
  width?: AppPageShellWidth;
  className?: string;
};

export function AppPageShell({
  children,
  width = "default",
  className,
}: AppPageShellProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full py-8 sm:py-10",
        appContentPaddingClass,
        appContentWidthClass[width],
        className,
      )}
    >
      <div className="flex flex-col gap-8">{children}</div>
    </div>
  );
}
