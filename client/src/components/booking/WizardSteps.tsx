const LABELS = ["Service", "Where", "When", "Your details"];

export function WizardSteps({ step }: { step: number }) {
  return (
    <div>
      {/* On a phone: one clear line. On a wider screen: the whole list */}
      <p className="font-medium sm:hidden">
        Step {step} of {LABELS.length}: {LABELS[step - 1]}
      </p>
      <ol aria-label="Booking steps" className="hidden flex-wrap gap-x-6 gap-y-2 sm:flex">
        {LABELS.map((label, index) => {
          const number = index + 1;
          const state = number < step ? "done" : number === step ? "current" : "upcoming";
          return (
            <li key={label} aria-current={state === "current" ? "step" : undefined} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  state === "done" ? "border-cocoa bg-cocoa text-ivory" : state === "current" ? "border-gold-deep font-medium" : "border-cocoa"
                }`}
              >
                {state === "done" ? "✓" : number}
              </span>
              <span className={state === "current" ? "font-medium" : ""}>{label}</span>
              <span className="sr-only">{state === "done" ? ", done" : state === "current" ? ", current step" : ""}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}