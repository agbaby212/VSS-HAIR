import type { UseFormReturn } from "react-hook-form";
import { InspirationUpload } from "../../components/booking/InspirationUpload";
import { TextAreaField, TextField } from "../../components/ui/FormFields";
import { formatDateLong, naira } from "../../lib/format";
import type { TravelZone } from "../../shared";
import type { Bookable, BookingDraft } from "./bookingDraft";
import type { DetailsForm } from "./bookingPayload";
import type { InspirationState } from "./useInspiration";

type Props = {
  form: UseFormReturn<DetailsForm>;
  item: Bookable;
  draft: BookingDraft;
  zone?: TravelZone;
  inspiration: InspirationState;
  onChangeArea: () => void; // goes back to step 2
  onChangeDate: () => void; // goes back to step 3
};

const linkButton = "text-gold-deep underline underline-offset-4";

export function StepDetails({ form, item, draft, zone, inspiration, onChangeArea, onChangeDate }: Props) {
  const {
    register,
    formState: { errors, submitCount },
  } = form;
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="space-y-8">
      {/* After a failed try, say once, loudly, that something needs fixing. The details are under each field */}
      {submitCount > 0 && hasErrors && (
        <p role="alert" className="border-l-4 border-gold-deep pl-3 font-medium">
          Some details need fixing. Check the fields marked below.
        </p>
      )}
      {errors.root?.message && (
        <p role="alert" className="border-l-4 border-gold-deep pl-3 font-medium">
          {errors.root.message}
        </p>
      )}

      <fieldset className="space-y-4">
        <legend className="mb-1 text-xl">About you</legend>
        <TextField label="Your name" autoComplete="name" error={errors.customerName?.message} {...register("customerName")} />
        <div>
          <TextField
            label="Phone number"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <p className="mt-1 max-w-prose text-sm">Use the number you will send the WhatsApp message from, so the owner can match your booking.</p>
        </div>
      </fieldset>

      {/* Only a home visit has an address */}
      {draft.locationType === "home" && (
        <fieldset className="space-y-4">
          <legend className="mb-1 text-xl">Where we come to you</legend>
          <p>
            Area: <strong>{zone ? zone.name : "not chosen"}</strong>
            {zone ? ` (travel fee ${naira(zone.feeKobo)})` : ""}.{" "}
            <button type="button" onClick={onChangeArea} className={linkButton}>
              Change area
            </button>
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="State" autoComplete="address-level1" error={errors.state?.message} {...register("state")} />
            <TextField label="City or town" autoComplete="address-level2" error={errors.city?.message} {...register("city")} />
          </div>
          <TextField label="Full address" autoComplete="street-address" error={errors.address?.message} {...register("address")} />
          <TextField label="Landmark (optional)" error={errors.landmark?.message} {...register("landmark")} />
        </fieldset>
      )}

      {/* Only a bridal service or package has an event block */}
      {item.isBridal && (
        <fieldset className="space-y-4">
          <legend className="mb-1 text-xl">Your event</legend>
          <p>
            Event date: <strong>{draft.date ? formatDateLong(draft.date) : "not chosen"}</strong>. This is the date you picked.{" "}
            <button type="button" onClick={onChangeDate} className={linkButton}>
              Change date
            </button>
          </p>
          <TextField label="Venue" error={errors.venue?.message} {...register("venue")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Call time" type="time" error={errors.callTime?.message} {...register("callTime")} />
            <TextField
              label="People in your bridal party"
              type="number"
              inputMode="numeric"
              min={1}
              max={30}
              error={errors.partySize?.message}
              {...register("partySize")}
            />
          </div>
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1 h-5 w-5 accent-cocoa" {...register("trialSession")} />
            <span>I would like a trial session before the day</span>
          </label>
        </fieldset>
      )}

      <TextAreaField label="Note for the owner (optional)" rows={3} error={errors.notes?.message} {...register("notes")} />

      <InspirationUpload state={inspiration} />

      {/* Say what happens next BEFORE the customer presses the button */}
      <section aria-labelledby="next-title" className="bg-sand p-5">
        <h3 id="next-title" className="text-xl">
          {item.isBridal ? "Bridal deposit" : "What happens next"}
        </h3>
        {item.isBridal ? (
          <p className="mt-2 max-w-prose">
            Bridal bookings need a deposit. After you send your booking, the owner replies on WhatsApp with the amount and her account details.
            You pay her directly by bank transfer. Your date is only blocked for other brides once she confirms your deposit.
          </p>
        ) : (
          <p className="mt-2 max-w-prose">
            After you send your booking, the owner replies on WhatsApp to confirm it. Your time is held for you for a limited time, then it is
            released for other customers. You pay the owner by bank transfer. This site never takes payment.
          </p>
        )}
      </section>
    </div>
  );
}