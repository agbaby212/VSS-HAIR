import { useState } from "react";
import { useParams } from "react-router-dom";
import { BookingDetails } from "../components/booking/BookingDetails";
import { PolicyBox } from "../components/booking/PolicyBox";
import { Button } from "../components/ui/Button";
import { ErrorNotice } from "../components/ui/ErrorNotice";
import { canChange, draftFromBooking } from "../features/booking/bookingView";
import { CancelPanel } from "../features/booking/CancelPanel";
import { useManagedBooking } from "../features/booking/queries";
import { ReschedulePanel } from "../features/booking/ReschedulePanel";
import { useNoIndex } from "../lib/useNoIndex";
import { whatsappChatUrl } from "../lib/whatsapp";

type Mode = "view" | "reschedule" | "cancel";

const linkClass = "text-gold-deep underline underline-offset-4";

export default function ManageBooking() {
  const { token = "" } = useParams();
  useNoIndex(); // the address holds a secret
  const query = useManagedBooking(token);
  const [mode, setMode] = useState<Mode>("view");
  const [done, setDone] = useState<string | null>(null);

  const booking = query.data;
  const changeable = booking ? canChange(booking.status) : false;
  const draft = booking ? draftFromBooking(booking) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl">Manage your booking</h1>

      {query.isPending && (
        <div aria-busy="true" className="mt-8 space-y-3">
          <p className="sr-only" role="status">
            Loading your booking
          </p>
          <div aria-hidden="true" className="h-56 animate-pulse bg-sand" />
        </div>
      )}

      {query.isError && (
        <div className="mt-8 space-y-4">
          <ErrorNotice error={query.error} onRetry={() => void query.refetch()} title="We could not load your booking" />
          <p className="max-w-prose">
            Check that you opened the whole link, or message the owner on{" "}
            <a href={whatsappChatUrl()} target="_blank" rel="noopener noreferrer" className={linkClass}>
              WhatsApp
            </a>
            .
          </p>
        </div>
      )}

      {booking && (
        <>
          {/* role="status": the result is read aloud */}
          <div role="status">
            {done && <p className="mt-6 border-l-4 border-gold-deep pl-3 font-medium">{done}</p>}
          </div>

          <div className="mt-6">
            <BookingDetails booking={booking} />
          </div>

          {changeable && mode === "view" && (
            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap gap-3">
                {/* A bridal date is blocked for other brides, so the owner moves it, not the website */}
                {!booking.isBridal && draft && (
                  <Button variant="secondary" onClick={() => { setDone(null); setMode("reschedule"); }}>
                    Change time
                  </Button>
                )}
                <Button variant="secondary" onClick={() => { setDone(null); setMode("cancel"); }}>
                  Cancel booking
                </Button>
              </div>
              {booking.isBridal && (
                <p className="max-w-prose">
                  To change the date of a bridal booking, message the owner on{" "}
                  <a href={whatsappChatUrl()} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    WhatsApp
                  </a>
                  .
                </p>
              )}
            </div>
          )}

          {mode === "reschedule" && draft && (
            <ReschedulePanel
              token={token}
              initial={draft}
              onClose={() => setMode("view")}
              onMoved={() => {
                setMode("view");
                setDone("Your new time is saved.");
              }}
            />
          )}

          {mode === "cancel" && (
            <CancelPanel
              token={token}
              onClose={() => setMode("view")}
              onCancelled={() => {
                setMode("view");
                setDone(
                  booking.isBridal && booking.depositPaid
                    ? "Your booking is cancelled. You paid a deposit, so please talk to the owner on WhatsApp."
                    : "Your booking is cancelled.",
                );
              }}
            />
          )}

          {/* The rules are on the page before anyone presses Cancel. The panels show them again */}
          {changeable && mode === "view" && (
            <div className="mt-8">
              <PolicyBox />
            </div>
          )}
        </>
      )}
    </div>
  );
}