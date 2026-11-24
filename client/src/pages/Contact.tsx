import { Link } from "react-router-dom";
import { buttonClasses } from "../components/ui/buttonClasses";
import { usePublicSettings } from "../features/shop/queries";
import { whatsappChatUrl } from "../lib/whatsapp";

export default function Contact() {
  const { data: settings } = usePublicSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl">Contact us</h1>
      <p className="mt-2 max-w-prose text-lg">The fastest way to reach us is WhatsApp.</p>
      <a
        href={whatsappChatUrl("Hello VSS Hair, I have a question.")}
        target="_blank"
        rel="noopener noreferrer"
        className={`${buttonClasses({ size: "lg" })} mt-5`}
      >
        Chat on WhatsApp
      </a>

      <section aria-labelledby="visit-title" className="mt-12">
        <h2 id="visit-title" className="text-3xl">Visit us</h2>
        <p className="mt-3">{settings?.business.address ?? "..."}</p>
        <p className="mt-1">Opening hours: {settings?.business.hoursText ?? "..."}</p>
        <p className="mt-3 max-w-prose text-sm">[REPLACE] Add a landmark or simple directions so a new customer can find the salon.</p>
      </section>

      <section aria-labelledby="help-title" className="mt-10">
        <h2 id="help-title" className="text-3xl">Orders and bookings</h2>
        <ul className="mt-3 space-y-2">
          <li>
            Already ordered?{" "}
            <Link to="/track" className="text-gold-deep underline underline-offset-4">Track your order</Link> with your order number and phone
            number.
          </li>
          <li>Need to change a booking? Use the link in your booking message to reschedule or cancel.</li>
          <li>
            Choosing a service?{" "}
            <Link to="/services" className="text-gold-deep underline underline-offset-4">See services and prices</Link>.
          </li>
        </ul>
      </section>

      <section aria-labelledby="social-title" className="mt-10">
        <h2 id="social-title" className="text-3xl">Follow us</h2>
        <p className="mt-3">[REPLACE] Instagram, TikTok or Facebook links, with the exact account names.</p>
      </section>
    </div>
  );
}