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
        "mx-auto w-full py-5 sm:py-6",
        appContentPaddingClass,
        appContentWidthClass[width],
        className,
      )}
    >
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}
