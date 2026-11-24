import { useEffect, useReducer, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { BookingSummary } from "../../components/booking/BookingSummary";
import { WizardSteps } from "../../components/booking/WizardSteps";
import { Button } from "../../components/ui/Button";
import type { ServicesResponse } from "../../shared";
import { bookingReducer, findBookable, isStepComplete, type BookingDraft, type Step } from "./bookingDraft";
import { describeBookingFailure } from "./bookingErrors";
import { DETAILS_FIELDS, validateBookingDetails, type DetailsForm } from "./bookingPayload";
import { useCreateBooking, useTravelZones } from "./queries";
import { StepDetails } from "./StepDetails";
import { StepLocation } from "./StepLocation";
import { StepService } from "./StepService";
import { StepSlot } from "./StepSlot";
import { useBookingForm } from "./useBookingForm";
import { useInspiration } from "./useInspiration";

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
    // A problem to show above the steps ("that time was taken") and one for step 4 ("we could not send")
  const [notice, setNotice] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  // The form and the photo live here, not in step 4, so Back and Continue never lose what was typed
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const inspiration = useInspiration();
  const form = useBookingForm(draft, item, inspiration.url);
  const createBooking = useCreateBooking();

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

  // Moving by hand clears an old problem message
  function moveTo(next: Step) {
    setNotice(null);
    setStep(next);
  }

  async function send(details: DetailsForm) {
    // The form already checked this. We check again to get the cleaned request (and to keep TypeScript happy)
    const checked = validateBookingDetails(draft, item, details, inspiration.url);
    if (!checked.ok) return;

    setSendError(null);
    try {
      const result = await createBooking.mutateAsync(checked.payload);
      // Try to open WhatsApp now. A phone may block it, so the next page also has a button
      window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
      navigate(`/book/confirmed/${encodeURIComponent(result.booking.bookingRef)}`, {
        state: { whatsappUrl: result.whatsappUrl, manageToken: result.booking.manageToken },
      });
    } catch (error) {
      const failure = describeBookingFailure(error);
      switch (failure.kind) {
        case "slot_taken":
          // Keep everything, clear only the time, and show fresh times
          void queryClient.invalidateQueries({ queryKey: ["slots"] });
          dispatch({ type: "chooseSlot", slotStart: null });
          setNotice(failure.message);
          setStep(3);
          break;
        case "area":
          setNotice(failure.message);
          setStep(2);
          break;
        case "fields":
          for (const field of DETAILS_FIELDS) {
            const message = failure.fields[field];
            if (message) form.setError(field, { type: "server", message });
          }
          setSendError(failure.message);
          break;
        case "other":
          setSendError(failure.message);
          break;
      }
    }
  }

  const sending = createBooking.isPending;

  return (
    <div className="mt-6 lg:grid lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-12">
      {/* One form around all the steps. Only step 4 can send it, so pressing Enter in the date box does nothing */}
      <form
        noValidate
        onSubmit={(event) => {
          if (step === 4) void form.handleSubmit(send)(event);
          else event.preventDefault();
        }}
      >
        <WizardSteps step={step} />

        <h2 ref={headingRef} tabIndex={-1} className="mt-6 text-3xl outline-none">
          {TITLES[step]}
        </h2>

        {notice && (
          <p role="alert" className="mt-4 border-l-4 border-gold-deep pl-3 font-medium">
            {notice}
          </p>
        )}

        <div className="mt-5">
          {step === 1 && <StepService data={data} draft={draft} dispatch={dispatch} />}
          {step === 2 && item && <StepLocation item={item} draft={draft} dispatch={dispatch} />}
          {step === 3 && <StepSlot draft={draft} dispatch={dispatch} />}
          {step === 4 && item && (
            <StepDetails
              form={form}
              item={item}
              draft={draft}
              zone={zone}
              inspiration={inspiration}
              onChangeArea={() => moveTo(2)}
              onChangeDate={() => moveTo(3)}
            />
          )}
        </div>

        {step === 4 && sendError && (
          <p role="alert" className="mt-6 border-l-4 border-gold-deep pl-3 font-medium">
            {sendError}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          {step > 1 ? (
            <Button type="button" variant="secondary" disabled={sending} onClick={() => moveTo((step - 1) as Step)}>
              Back
            </Button>
          ) : (
            <span />
          )}
          {step < 4 ? (
            <Button type="button" size="lg" disabled={!canContinue} onClick={() => moveTo((step + 1) as Step)}>
              Continue
            </Button>
          ) : (
            <Button type="submit" size="lg" disabled={sending || inspiration.uploading}>
              {sending ? "Sending..." : "Send booking on WhatsApp"}
            </Button>
          )}
        </div>
        {step === 4 && inspiration.uploading && <p className="mt-2 text-right text-sm">Wait for your photo to finish uploading.</p>}
        {step < 4 && !canContinue && (
          <p className="mt-2 text-right text-sm">
            {step === 1 && "Choose a service to continue."}
            {step === 2 && "Choose where, and your area for a home visit, to continue."}
            {step === 3 && "Choose a date and a time to continue."}
          </p>
        )}
      </form>

      <div className="mt-10 lg:mt-0">
        <BookingSummary item={item} draft={draft} zone={zone} />
      </div>
    </div>
  );
}