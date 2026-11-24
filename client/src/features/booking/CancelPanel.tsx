import { useEffect, useRef, useState } from "react";
import { PolicyBox } from "../../components/booking/PolicyBox";
import { Button } from "../../components/ui/Button";
import { describeBookingFailure } from "./bookingErrors";
import { useUpdateBooking } from "./queries";

type Props = { token: string; onClose: () => void; onCancelled: () => void };

export function CancelPanel({ token, onClose, onCancelled }: Props) {
  const update = useUpdateBooking(token);
  const [problem, setProblem] = useState<string | null>(null);

  // Move the keyboard focus into the panel when it opens, so a screen reader says what appeared
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  async function cancel() {
    setProblem(null);
    try {
      await update.mutateAsync({ action: "cancel" });
      onCancelled();
    } catch (error) {
      // The server decides what the policy allows, so we show its own message
      setProblem(describeBookingFailure(error).message);
    }
  }

  return (
    <section aria-labelledby="cancel-title" className="mt-6 space-y-5 border-2 border-cocoa bg-ivory p-6">
      <h2 id="cancel-title" ref={headingRef} tabIndex={-1} className="text-2xl outline-none">
        Cancel this booking?
      </h2>

      {/* The policy comes BEFORE the button that cancels */}
      <PolicyBox />

      {problem && (
        <p role="alert" className="border-l-4 border-gold-deep pl-3 font-medium">
          {problem}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button disabled={update.isPending} onClick={onClose}>
          Keep my booking
        </Button>
        <Button variant="secondary" disabled={update.isPending} onClick={() => void cancel()}>
          {update.isPending ? "Cancelling..." : "Yes, cancel my booking"}
        </Button>
      </div>
    </section>
  );
}