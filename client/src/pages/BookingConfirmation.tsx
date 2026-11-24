import { Link, useLocation, useParams } from "react-router-dom";
import { whatsappChatUrl } from "../lib/whatsapp";

type ConfirmationState = { whatsappUrl: string; manageToken: string };

// Router state is "unknown" to TypeScript. We check it instead of trusting it
function readState(value: unknown): ConfirmationState | null {
  if (typeof value !== "object" || value === null) return null;
  const { whatsappUrl, manageToken } = value as Record<string, unknown>;
  return typeof whatsappUrl === "string" && typeof manageToken === "string" ? { whatsappUrl, manageToken } : null;
}

const buttonClass = "inline-flex min-h-[2.75rem] items-center justify-center bg-cocoa px-6 text-ivory";

export default function BookingConfirmation() {
  const { ref } = useParams();
  const state = readState(useLocation().state);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-4xl">Your booking {ref} is saved</h1>
      <p className="mt-3 text-lg">
        Send the booking message to the owner on WhatsApp, then wait for her reply. She will confirm your booking and share her account details.
      </p>

      {state ? (
        <a href={state.whatsappUrl} target="_blank" rel="noopener noreferrer" className={`${buttonClass} mt-6`}>
          Open WhatsApp again
        </a>
      ) : (
        <p className="mt-6 max-w-prose">
          If WhatsApp did not open, message the owner on{" "}
          <a href={whatsappChatUrl()} target="_blank" rel="noopener noreferrer" className="text-gold-deep underline underline-offset-4">
            WhatsApp
          </a>{" "}
          and give her your booking number, {ref}.
        </p>
      )}

      <p className="mt-8">
        <Link to="/book" className="text-gold-deep underline underline-offset-4">
          Book another appointment
        </Link>
      </p>
    </div>
  );
}