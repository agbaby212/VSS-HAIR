import { ApiError } from "../../lib/api";
import { Button } from "./Button";

type ErrorNoticeProps = {
  error: unknown; // whatever TanStack Query gives us
  onRetry?: () => void;
  title?: string;
};

// Says what went wrong and offers a fix (design rule). role="alert" makes screen readers read it out
export function ErrorNotice({ error, onRetry, title = "We could not load this" }: ErrorNoticeProps) {
  const message = error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
  return (
    <div role="alert" className="border border-gold-deep bg-sand p-4">
      <p className="font-medium">{title}</p>
      <p className="mt-1">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}