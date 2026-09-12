import { Link } from "react-router-dom";
import { AppPageShell, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <AppPageShell>
      <PageHeader
        title="Page not found"
        description="That address is not a page in this app."
      />
      <Button asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </AppPageShell>
  );
}
