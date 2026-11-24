import { useState } from "react";
import { Button } from "./Button";

type CopyButtonProps = { text: string; label?: string };

export function CopyButton({ text, label = "Copy" }: CopyButtonProps) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text); // needs https or localhost
      setState("copied");
    } catch {
      setState("failed"); // blocked or unsupported
    }
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      <Button variant="secondary" onClick={() => void copy()}>
        {state === "copied" ? "Copied" : label}
      </Button>
      {/* role="status" so a screen reader says what happened */}
      <span role="status" className="text-sm">
        {state === "copied" && "Copied to your clipboard."}
        {state === "failed" && "We could not copy it. Select the text and copy it yourself."}
      </span>
    </span>
  );
}