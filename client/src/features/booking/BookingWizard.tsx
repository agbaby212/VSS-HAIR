import { useEffect, useReducer, useRef, useState } from "react";
import { BookingSummary } from "../../components/booking/BookingSummary";
import { WizardSteps } from "../../components/booking/WizardSteps";
import { Button } from "../../components/ui/Button";
import type { ServicesResponse } from "../../shared";
import { bookingReducer, findBookable, isStepComplete, type BookingDraft, type Step } from "./bookingDraft";
import { useTravelZones } from "./queries";
import { StepLocation } from "./StepLocation";
import { StepService } from "./StepService";
import { StepSlot } from "./StepSlot";

const TITLES: Record<Step, string> = {
  1: "Choose a service",
  2: "Where do you want it?",
  3: "Pick a date and time",
  4: "Your details",
};

type Props = { data: ServicesResponse; initial: BookingDraft };

export function BookingWizard({ data, initial }: Props) {
  const [draft, dispatch] = useReducer(bookingReducer, initial);
  // Coming from a "Book" link we already know the service, so we start at step 2
  const [step, setStep] = useState<Step>(initial.itemId ? 2 : 1);

  const item = draft.kind && draft.itemId ? findBookable(data, draft.kind, draft.itemId) : null;
  const travelZones = useTravelZones();
  const zone = travelZones.data?.find((candidate) => candidate.id === draft.travelZoneId);

  // Move the keyboard focus to the heading only when the step CHANGES
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(step);
  useEffect(() => {
    if (previousStep.current !== step) {
      previousStep.current = step;
      headingRef.current?.focus();
    }
  }, [step]);

  const canContinue = isStepComplete(step, draft);

  return (
    <div className="mt-6 lg:grid lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-12">
      <div>
        <WizardSteps step={step} />

        <h2 ref={headingRef} tabIndex={-1} className="mt-6 text-3xl outline-none">
          {TITLES[step]}
        </h2>

        <div className="mt-5">
          {step === 1 && <StepService data={data} draft={draft} dispatch={dispatch} />}
          {step === 2 && item && <StepLocation item={item} draft={draft} dispatch={dispatch} />}
          {step === 3 && <StepSlot draft={draft} dispatch={dispatch} />}
          {step === 4 && <p className="max-w-prose">Your details come in the next part of this task.</p>}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          {step > 1 ? (
            <Button variant="secondary" onClick={() => setStep((current) => (current - 1) as Step)}>
              Back
            </Button>
          ) : (
            <span />
          )}
          {step < 4 && (
            <Button size="lg" disabled={!canContinue} onClick={() => setStep((current) => (current + 1) as Step)}>
              Continue
            </Button>
          )}
        </div>
        {step < 4 && !canContinue && (
          <p className="mt-2 text-right text-sm">
            {step === 1 && "Choose a service to continue."}
            {step === 2 && "Choose where, and your area for a home visit, to continue."}
            {step === 3 && "Choose a date and a time to continue."}
          </p>
        )}
      </div>

      <div className="mt-10 lg:mt-0">
        <BookingSummary item={item} draft={draft} zone={zone} />
      </div>
    </div>
  );
}