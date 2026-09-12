import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { UnauthorizedGate } from "@/providers/UnauthorizedGate";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <UnauthorizedGate>
          {children}
          <Toaster position="bottom-right" richColors />
        </UnauthorizedGate>
      </ThemeProvider>
    </QueryProvider>
  );
}
