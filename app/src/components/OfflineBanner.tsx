import { WifiOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useOnlineStatus } from "@/lib/hooks/use-online-status";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <Alert className="rounded-none border-x-0 border-t-0">
      <WifiOff aria-hidden />
      <AlertTitle>You&apos;re offline</AlertTitle>
      <AlertDescription>
        Saved data may still appear. Changes sync when you reconnect.
      </AlertDescription>
    </Alert>
  );
}
