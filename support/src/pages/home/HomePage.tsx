import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  AppPageShell,
  PageFooterActions,
  PageHeader,
  PageSection,
} from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useCounterStore } from "@/lib/stores/counterStore";
import { ExamplesSection } from "./ExamplesSection";
import { DemoErrorTrigger } from "./DemoErrorTrigger";

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function ThemeToggle() {
  const mounted = useMounted();
  const { theme, setTheme } = useTheme();

  if (!mounted) {
    return <div className="size-8 shrink-0" aria-hidden />;
  }

  return (
    <div
      className="bg-muted inline-flex shrink-0 rounded-md border p-0.5"
      role="group"
      aria-label="Theme"
    >
      {themeOptions.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn("size-8", theme === value && "bg-background shadow-sm")}
          onClick={() => setTheme(value)}
          aria-label={label}
          aria-pressed={theme === value}
        >
          <Icon className="size-4" aria-hidden />
        </Button>
      ))}
    </div>
  );
}

export function HomePage() {
  const count = useCounterStore((s) => s.count);
  const increment = useCounterStore((s) => s.increment);
  const decrement = useCounterStore((s) => s.decrement);
  const reset = useCounterStore((s) => s.reset);

  return (
    <AppPageShell width="default">
      <PageHeader
        title="App"
        description="Golden-path examples for layout, API, and async UI patterns."
        action={<ThemeToggle />}
      />

      <PageSection>
        <Card size="sm" className="shadow-sm">
          <CardHeader>
            <CardTitle>Counter</CardTitle>
            <span className="text-2xl font-semibold tabular-nums">{count}</span>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => increment()}
              >
                +1
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => decrement()}
              >
                −1
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="w-full sm:w-auto"
                onClick={() => reset()}
              >
                Reset
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-muted-foreground w-full sm:w-auto"
                onClick={() =>
                  toast.message("Count", {
                    description: String(useCounterStore.getState().count),
                  })
                }
              >
                Toast
              </Button>
            </div>
          </CardContent>
        </Card>
        <PageFooterActions>
          <Button
            type="button"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() =>
              toast.success("Saved", {
                description: "Demo footer action — full width on mobile.",
              })
            }
          >
            Save demo
          </Button>
        </PageFooterActions>
      </PageSection>

      <PageSection bordered>
        <ExamplesSection />
      </PageSection>

      <PageSection bordered>
        <Card size="sm" className="shadow-sm">
          <CardHeader>
            <CardTitle>Error boundary</CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorBoundary layout="embedded">
              <DemoErrorTrigger />
            </ErrorBoundary>
          </CardContent>
        </Card>
      </PageSection>
    </AppPageShell>
  );
}
