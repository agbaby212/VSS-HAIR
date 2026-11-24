import { formatDateLong, formatTime, naira } from "../../lib/format";
import type { TravelZone } from "../../shared";
import { formatDuration } from "../../features/booking/serviceUtils";
import type { Bookable, BookingDraft } from "../../features/booking/bookingDraft";

type BookingSummaryProps = { item: Bookable | null; draft: BookingDraft; zone?: TravelZone };

export function BookingSummary({ item, draft, zone }: BookingSummaryProps) {
  if (!item) return null;
  const travelFeeKobo = draft.locationType === "home" && zone ? zone.feeKobo : 0;
  const where =
    draft.locationType === "salon" ? "At the salon" : draft.locationType === "home" ? `At your place${zone ? `, ${zone.name}` : ""}` : "Not chosen yet";
  const when = draft.date && draft.slotStart ? `${formatDateLong(draft.date)}, ${formatTime(draft.slotStart)}` : "Not chosen yet";

  return (
    <section aria-labelledby="summary-title" className="bg-sand p-6">
      <h2 id="summary-title" className="text-2xl">
        Your booking
      </h2>
      {/* role="status": the summary is read aloud when your choices change */}
      <dl role="status" className="mt-4 space-y-3">
        <div>
          <dt className="text-sm">Service</dt>
          <dd className="font-medium">
            {item.name} <span className="font-normal">({formatDuration(item.durationMin)})</span>
          </dd>
        </div>
        <div>
          <dt className="text-sm">Where</dt>
          <dd>{where}</dd>
        </div>
        <div>
          <dt className="text-sm">When</dt>
          <dd>{when}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-gold pt-3">
          <dt>Price</dt>
          <dd>{naira(item.priceKobo)}</dd>
        </div>
        {travelFeeKobo > 0 && (
          <div className="flex justify-between gap-4">
            <dt>Travel fee</dt>
            <dd>{naira(travelFeeKobo)}</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between gap-4 border-t border-gold pt-3 text-lg font-medium">
          <dt>Total</dt>
          <dd className="font-display text-2xl text-gold-deep">{naira(item.priceKobo + travelFeeKobo)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-sm">You pay the owner by bank transfer. This site never takes payment.</p>
    </section>
  );
}