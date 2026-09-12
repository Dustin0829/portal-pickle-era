import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DemoErrorTrigger() {
  const [fail, setFail] = useState(false);
  if (fail) throw new Error("Demo error — boundary caught this.");
  return (
    <Button type="button" variant="destructive" onClick={() => setFail(true)}>
      Trigger error (local boundary)
    </Button>
  );
}
