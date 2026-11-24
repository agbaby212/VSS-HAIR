import { readPolicy } from "../../features/booking/cancellationPolicy";
import { usePublicSettings } from "../../features/shop/queries";

// The owner writes this text in the admin (FE-T14). We only show it
export function PolicyBox({ title = "Cancellation policy" }: { title?: string }) {
  const settings = usePublicSettings();
  const paragraphs = readPolicy(settings.data?.cancellationPolicy);

  return (
    <section className="border-l-4 border-gold-deep pl-4">
      <h3 className="text-xl">{title}</h3>
      <div className="mt-2 max-w-prose space-y-2">
        {settings.isPending ? (
          <p>Loading the policy...</p>
        ) : settings.isError ? (
          <p>We could not load the policy. Message the owner on WhatsApp before you change your booking.</p>
        ) : paragraphs ? (
          paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
        ) : (
          <p>Ask the owner on WhatsApp about changes, cancellations and refunds.</p>
        )}
      </div>
    </section>
  );
}