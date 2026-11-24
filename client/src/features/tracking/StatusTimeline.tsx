import type { OrderStatus } from "../../shared";
import { STATUS_LABELS, TIMELINE, stepState, type StepState } from "./orderStatus";

const stateWord: Record<StepState, string> = { done: "Done", current: "Now", upcoming: "Not yet" };

function Marker({ state }: { state: StepState }) {
  // Three different shapes, so colour is never the only clue
  if (state === "done") {
    return (
      <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-cocoa text-ivory">
        ✓
      </span>
    );
  }
  if (state === "current") {
    return <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full border-4 border-gold-deep bg-ivory" />;
  }
  return <span aria-hidden="true" className="flex h-8 w-8 rounded-full border-2 border-cocoa" />;
}

export function StatusTimeline({ status }: { status: OrderStatus }) {
  return (
    <ol aria-label="Order progress">
      {TIMELINE.map((step, index) => {
        const state = stepState(status, step);
        const last = index === TIMELINE.length - 1;
        return (
          <li key={step} aria-current={state === "current" ? "step" : undefined} className="flex gap-4">
            <div className="flex flex-col items-center">
              <Marker state={state} />
              {!last && <span aria-hidden="true" className={`w-0.5 flex-1 ${state === "done" ? "bg-cocoa" : "bg-gold"}`} />}
            </div>
            <div className={last ? "" : "pb-6"}>
              <p className="font-medium">{STATUS_LABELS[step]}</p>
              <p className="text-sm">{stateWord[state]}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}