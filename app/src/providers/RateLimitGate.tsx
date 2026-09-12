import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/providers/QueryProvider";
import { useRateLimitedStore } from "@/lib/network/rateLimited";

export function RateLimitGate({ children }: { children: ReactNode }) {
  const blocked = useRateLimitedStore((s) => s.blocked);
  const clearBlocked = useRateLimitedStore((s) => s.clearBlocked);

  if (blocked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <h1 className="text-xl font-semibold">Too many requests</h1>
        <p className="text-muted-foreground max-w-md text-center text-sm">
          You are browsing a bit fast. Wait a moment, then try again.
        </p>
        <Button
          type="button"
          onClick={() => {
            clearBlocked();
            void queryClient.resumePausedMutations();
            void queryClient.invalidateQueries();
          }}
        >
          Try again
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
