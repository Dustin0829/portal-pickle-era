import { Component, Fragment, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  children: ReactNode;
  /** `embedded` keeps the fallback inside the page flow (e.g. demo section). */
  layout?: "fullscreen" | "embedded";
};

type State = {
  error: Error | null;
  resetKey: number;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, resetKey: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    const layout = this.props.layout ?? "fullscreen";

    if (this.state.error) {
      if (layout === "embedded") {
        return (
          <div className="border-destructive/30 bg-destructive/5 space-y-3 rounded-xl border p-4">
            <p className="text-sm font-medium">Something went wrong</p>
            <p className="text-muted-foreground text-xs">
              {this.state.error.message}
            </p>
            <Button
              type="button"
              size="sm"
              onClick={() =>
                this.setState((s) => ({
                  error: null,
                  resetKey: s.resetKey + 1,
                }))
              }
            >
              Try again
            </Button>
          </div>
        );
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-muted-foreground max-w-md text-center text-sm">
            {this.state.error.message}
          </p>
          <Button
            type="button"
            onClick={() =>
              this.setState((s) => ({
                error: null,
                resetKey: s.resetKey + 1,
              }))
            }
          >
            Try again
          </Button>
        </div>
      );
    }

    return <Fragment key={this.state.resetKey}>{this.props.children}</Fragment>;
  }
}
