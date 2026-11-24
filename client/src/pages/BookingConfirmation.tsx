import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { BookingDetails } from "../components/booking/BookingDetails";
import { Button } from "../components/ui/Button";
import { messageFromWhatsappUrl } from "../features/booking/bookingView";
import { useManagedBooking } from "../features/booking/queries";
import { loadConfirmation, readConfirmationState, saveConfirmation } from "../lib/confirmationStore";
import { useNoIndex } from "../lib/useNoIndex";
import { whatsappChatUrl } from "../lib/whatsapp";

const linkClass = "text-gold-deep underline underline-offset-4";
const buttonClass = "inline-flex min-h-[2.75rem] items-center justify-center bg-cocoa px-6 text-ivory";

export default function BookingConfirmation() {
  const { ref = "" } = useParams();
  useNoIndex(); // this page shows the secret manage link

  // The wizard passes the info in router state. On a refresh that state is gone, so we also keep a copy for this tab
  const location = useLocation();
  const fromState = useMemo(() => readConfirmationState(location.state), [location.state]);
  useEffect(() => {
    if (fromState) saveConfirmation(ref, fromState);
  }, [fromState, ref]);
  const info = fromState ?? loadConfirmation(ref);

  const booking = useManagedBooking(info?.manageToken ?? ""); // does nothing without a token
  const message = info ? messageFromWhatsappUrl(info.whatsappUrl) : null;
  const managePath = info ? `/booking/manage/${encodeURIComponent(info.manageToken)}` : null;

  const [copyNote, setCopyNote] = useState("");
  async function copyLink() {
    if (!managePath) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${managePath}`);
      setCopyNote("Link copied.");
    } catch {
      setCopyNote("We could not copy it. Open the link and copy it from the address bar.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl">Your booking {ref} is saved</h1>

      <ol className="mt-4 max-w-prose list-inside list-decimal space-y-1 text-lg">
        <li>Send the booking message to the owner on WhatsApp.</li>
        <li>Wait for her reply with her account details.</li>
      </ol>

      {info ? (
        <a href={info.whatsappUrl} target="_blank" rel="noopener noreferrer" className={`${buttonClass} mt-6`}>
          Open WhatsApp
        </a>
      ) : (
        <p className="mt-6 max-w-prose">
          If WhatsApp did not open, message the owner on{" "}
          <a href={whatsappChatUrl()} target="_blank" rel="noopener noreferrer" className={linkClass}>
            WhatsApp
          </a>{" "}
          and give her your booking number, {ref}.
        </p>
      )}

      {message && (
        <section aria-labelledby="message-title" className="mt-8 bg-sand p-5">
          <h2 id="message-title" className="text-xl">
            The message
          </h2>
          <p className="mt-2 whitespace-pre-wrap">{message}</p>
        </section>
      )}

      {info && (
        <div className="mt-8">
          {booking.isPending && (
            <div aria-busy="true">
              <p className="sr-only" role="status">
                Loading your booking
              </p>
              <div aria-hidden="true" className="h-56 animate-pulse bg-sand" />
            </div>
          )}
          {/* Your booking is saved even if this card cannot load, so the message says so */}
          {booking.isError && (
            <p role="status" className="max-w-prose">
              We could not load the booking card, but your booking is saved.{" "}
              <button type="button" onClick={() => void booking.refetch()} className={linkClass}>
                Try again
              </button>
            </p>
          )}
          {booking.data && <BookingDetails booking={booking.data} />}
        </div>
      )}

      {managePath && (
        <section aria-labelledby="manage-title" className="mt-8">
          <h2 id="manage-title" className="text-2xl">
            Keep this link
          </h2>
          <p className="mt-2 max-w-prose">Use it to change the time or cancel your booking. Anyone with this link can change it, so keep it private.</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Link to={managePath} className={linkClass}>
              Manage this booking
            </Link>
            <Button variant="secondary" onClick={() => void copyLink()}>
              Copy link
            </Button>
          </div>
          <p role="status" className="mt-2">
            {copyNote}
          </p>
        </section>
      )}

      <p className="mt-10">
        <Link to="/book" className={linkClass}>
          Book another appointment
        </Link>
      </p>
    </div>
  );
}