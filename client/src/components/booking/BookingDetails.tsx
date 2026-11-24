import { describeBooking, type BookingFacts } from "../../features/booking/bookingView";
import { useServices, useTravelZones } from "../../features/booking/queries";
import { formatDuration } from "../../features/booking/serviceUtils";
import { naira } from "../../lib/format";

type Props = { booking: BookingFacts & { bookingRef: string } };

export function BookingDetails({ booking }: Props) {
  const services = useServices();
  const zones = useTravelZones();
  const view = describeBooking(booking, services.data, zones.data);

  // Shape as well as colour: a cancelled or missed booking has a dashed border
  const closed = booking.status === "cancelled" || booking.status === "no_show";
  const good = booking.status === "confirmed" || booking.status === "completed";
  const badge = `inline-flex rounded-full border-2 px-3 py-1 font-medium ${closed ? "border-dashed border-cocoa" : good ? "border-gold-deep" : "border-cocoa"}`;

  return (
    <section aria-labelledby="details-title" className="bg-sand p-6">
      <h2 id="details-title" className="text-2xl">
        Booking {booking.bookingRef}
      </h2>
      <p className="mt-3">
        <span className={badge}>{view.statusLabel}</span>
      </p>
      {view.statusHelp && <p className="mt-2 max-w-prose">{view.statusHelp}</p>}
      {view.holdText && <p className="mt-2 max-w-prose">{view.holdText}</p>}

      <dl className="mt-4 space-y-3">
        <div>
          <dt className="text-sm">Service</dt>
          <dd className="font-medium">
            {view.name ?? (services.isPending ? "Loading..." : "Your appointment")}
            {view.durationMin !== null && <span className="font-normal"> ({formatDuration(view.durationMin)})</span>}
          </dd>
        </div>
        <div>
          <dt className="text-sm">When</dt>
          <dd>{view.when}</dd>
        </div>
        <div>
          <dt className="text-sm">Where</dt>
          <dd>{view.where}</dd>
        </div>
        {view.priceKobo !== null && (
          <div className="flex justify-between gap-4 border-t border-gold pt-3">
            <dt>Price</dt>
            <dd>{naira(view.priceKobo)}</dd>
          </div>
        )}
        {view.travelFeeKobo > 0 && (
          <div className="flex justify-between gap-4">
            <dt>Travel fee</dt>
            <dd>{naira(view.travelFeeKobo)}</dd>
          </div>
        )}
        {view.totalKobo !== null && (
          <div className="flex items-baseline justify-between gap-4 border-t border-gold pt-3 text-lg font-medium">
            <dt>Total</dt>
            <dd className="font-display text-2xl text-gold-deep">{naira(view.totalKobo)}</dd>
          </div>
        )}
        {view.deposit && (
          <div className="flex justify-between gap-4 border-t border-gold pt-3">
            <dt>Deposit</dt>
            <dd>
              {naira(view.deposit.amountKobo)}, {view.deposit.received ? "received" : "not received yet"}
            </dd>
          </div>
        )}
      </dl>
      <p className="mt-3 text-sm">You pay the owner by bank transfer. This site never takes payment.</p>
    </section>
  );
}