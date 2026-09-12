import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/QueryProvider";
import { RateLimitGate } from "@/providers/RateLimitGate";
import { ThemeProvider } from "@/providers/ThemeProvider";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <RateLimitGate>
          {children}
          <Toaster position="bottom-right" richColors />
        </RateLimitGate>
      </ThemeProvider>
    </QueryProvider>
  );
}
