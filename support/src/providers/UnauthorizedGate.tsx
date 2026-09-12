import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/providers/QueryProvider";
import { useUnauthorizedStore } from "@/lib/network/unauthorized";

export function UnauthorizedGate({ children }: { children: ReactNode }) {
  const blocked = useUnauthorizedStore((s) => s.blocked);
  const clearUnauthorized = useUnauthorizedStore((s) => s.clearUnauthorized);

  if (blocked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <h1 className="text-xl font-semibold">Sign in required</h1>
        <p className="text-muted-foreground max-w-md text-center text-sm">
          This support tool is protected. Check admin basic auth credentials,
          then try again.
        </p>
        <Button
          type="button"
          onClick={() => {
            clearUnauthorized();
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
