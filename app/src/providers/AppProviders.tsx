import { Toaster } from "sonner";
import { AuthProvider } from "@/providers/AuthProvider";
import { BookingModalProvider } from "@/providers/BookingModalProvider";
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
          <AuthProvider>
            <BookingModalProvider>
              {children}
              <Toaster position="bottom-right" richColors />
            </BookingModalProvider>
          </AuthProvider>
        </RateLimitGate>
      </ThemeProvider>
    </QueryProvider>
  );
}
