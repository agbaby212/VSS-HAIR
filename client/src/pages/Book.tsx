import { useSearchParams } from "react-router-dom";
import { ErrorNotice } from "../components/ui/ErrorNotice";
import { BookingWizard } from "../features/booking/BookingWizard";
import { initialDraft } from "../features/booking/bookingDraft";
import { useServices } from "../features/booking/queries";
import { whatsappChatUrl } from "../lib/whatsapp";

export default function Book() {
  const query = useServices();
  const [params] = useSearchParams();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl">Book an appointment</h1>
      <p className="mt-2 max-w-prose text-lg">
        Choose a service and a time, then send your booking to the owner on WhatsApp. This site never takes payment.
      </p>

      {query.isPending && (
        <div aria-busy="true" className="mt-8 space-y-3">
          <p className="sr-only" role="status">Loading services</p>
          {[0, 1, 2, 3].map((n) => (
            <div key={n} aria-hidden="true" className="h-20 animate-pulse bg-sand" />
          ))}
        </div>
      )}

      {query.isError && (
        <div className="mt-8">
          <ErrorNotice error={query.error} onRetry={() => void query.refetch()} title="We could not load the services" />
        </div>
      )}

      {query.data && query.data.services.length + query.data.packages.length === 0 && (
        <p className="mt-8 max-w-prose">
          We are adding our services. Message us on{" "}
          <a href={whatsappChatUrl()} target="_blank" rel="noopener noreferrer" className="text-gold-deep underline underline-offset-4">
            WhatsApp
          </a>{" "}
          to book.
        </p>
      )}

      {/* The wizard only appears once the data is here, so it can build its starting state once, from real services */}
      {query.data && query.data.services.length + query.data.packages.length > 0 && (
        <BookingWizard data={query.data} initial={initialDraft(query.data, params.get("service"), params.get("package"))} />
      )}
    </div>
  );
}