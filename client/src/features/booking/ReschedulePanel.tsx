import { useEffect, useReducer, useRef, useState } from "react";
import { PolicyBox } from "../../components/booking/PolicyBox";
import { Button } from "../../components/ui/Button";
import { bookingReducer, type BookingDraft } from "./bookingDraft";
import { describeBookingFailure } from "./bookingErrors";
import { useUpdateBooking } from "./queries";
import { StepSlot } from "./StepSlot";

type Props = { token: string; initial: BookingDraft; onClose: () => void; onMoved: () => void };

export function ReschedulePanel({ token, initial, onClose, onMoved }: Props) {
  // The same reducer as the wizard, so the same rules apply: a new date clears the chosen time
  const [draft, dispatch] = useReducer(bookingReducer, initial);
  const update = useUpdateBooking(token);
  const [problem, setProblem] = useState<string | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  async function confirm() {
    if (!draft.slotStart) return;
    setProblem(null);
    try {
      await update.mutateAsync({ action: "reschedule", startAt: draft.slotStart });
      onMoved();
    } catch (error) {
      const failure = describeBookingFailure(error);
      if (failure.kind === "slot_taken") dispatch({ type: "chooseSlot", slotStart: null }); // keep the panel, clear only the time
      // "Please check the marked fields" means nothing here, so we say what to do
      setProblem(failure.kind === "fields" ? "We could not change your booking. Please choose a time again." : failure.message);
    }
  }

  return (
    <section aria-labelledby="reschedule-title" className="mt-6 space-y-5 border-2 border-cocoa bg-ivory p-6">
      <h2 id="reschedule-title" ref={headingRef} tabIndex={-1} className="text-2xl outline-none">
        Choose a new time
      </h2>

      <StepSlot draft={draft} dispatch={dispatch} />

      <PolicyBox title="Changes and the policy" />

      {problem && (
        <p role="alert" className="border-l-4 border-gold-deep pl-3 font-medium">
          {problem}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" disabled={update.isPending} onClick={onClose}>
          Keep my current time
        </Button>
        <Button disabled={!draft.slotStart || update.isPending} onClick={() => void confirm()}>
          {update.isPending ? "Saving..." : "Confirm new time"}
        </Button>
      </div>
      {!draft.slotStart && <p className="text-sm">Choose a date and a time to continue.</p>}
    </section>
  );
}