import { Link, useParams } from "react-router-dom";
import { OrderItems } from "../components/shop/OrderItems";
import { buttonClasses } from "../components/ui/buttonClasses";
import { CopyButton } from "../components/ui/CopyButton";
import { loadLastOrder } from "../features/checkout/lastOrder";
import { formatDateTime, naira } from "../lib/format";
import { isWhatsappUrl, messageFromWhatsappUrl } from "../lib/whatsapp";

export default function OrderConfirmation() {
  const { orderNumber = "" } = useParams();
  const saved = loadLastOrder();

  // A new tab, a closed tab, or a link someone sent: we only keep the last order for this tab
  if (!saved || saved.order.orderNumber !== orderNumber) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl">We cannot show that order here</h1>
        <p className="mt-3 max-w-prose">Use your order number and the phone number you gave us to check on it.</p>
        <Link to="/track" className={`${buttonClasses()} mt-6`}>
          Track an order
        </Link>
      </section>
    );
  }

  const { order, whatsappUrl } = saved;
  const canOpen = isWhatsappUrl(whatsappUrl); // only ever open a real WhatsApp link
  const message = canOpen ? messageFromWhatsappUrl(whatsappUrl) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl">Your order is saved</h1>
      <p className="mt-2 text-lg">Now send it to the owner on WhatsApp, so she can reply with her account details.</p>

      <section aria-labelledby="number-title" className="mt-6 bg-sand p-6">
        <h2 id="number-title" className="font-medium">
          Order number
        </h2>
        <p className="mt-1 font-display text-4xl text-gold-deep">{order.orderNumber}</p>
        <p className="mt-2">Keep this number. With your phone number, it lets you track your order.</p>
      </section>

      <section aria-labelledby="steps-title" className="mt-8">
        <h2 id="steps-title" className="text-2xl">
          What to do now
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>Open WhatsApp and send the message below.</li>
          <li>Wait for the owner's reply with her account details.</li>
          <li>Pay by bank transfer. She marks your order paid and you can follow it on the tracking page.</li>
        </ol>
        {order.holdExpiresAt && (
          <p className="mt-3">
            We keep your items until <strong>{formatDateTime(order.holdExpiresAt)}</strong> while you pay. After that the order is
            cancelled and the items go back on sale.
          </p>
        )}
        <p className="mt-2 text-sm">This site never takes payment.</p>
      </section>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        {canOpen && (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses({ size: "lg" })}>
            Open WhatsApp
          </a>
        )}
        {message && <CopyButton text={message} label="Copy message" />}
        <Link to={`/track?order=${encodeURIComponent(order.orderNumber)}`} className="inline-flex min-h-[2.75rem] items-center text-gold-deep underline underline-offset-4">
          Track this order
        </Link>
      </div>

      {message && (
        <section aria-labelledby="message-title" className="mt-8">
          <h2 id="message-title" className="text-2xl">
            Your message
          </h2>
          <p className="mt-1 text-sm">If WhatsApp did not open, copy this and send it to the owner yourself.</p>
          {/* whitespace-pre-wrap keeps the line breaks of the message */}
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words border-l-2 border-gold bg-sand p-4 font-sans">{message}</pre>
        </section>
      )}

      <section aria-labelledby="items-title" className="mt-8">
        <h2 id="items-title" className="text-2xl">
          Your order
        </h2>
        <div className="mt-3">
          <OrderItems items={order.items} />
        </div>
        <dl className="mt-4 space-y-2 border-t border-gold pt-3">
          <div className="flex justify-between gap-4">
            <dt>{order.fulfilment === "pickup" ? "Pickup" : `Delivery to ${order.state}`}</dt>
            <dd>{order.fulfilment === "pickup" ? "Free" : naira(order.deliveryFeeKobo)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 text-lg font-medium">
            <dt>Total</dt>
            <dd className="font-display text-2xl text-gold-deep">{naira(order.totalKobo)}</dd>
          </div>
        </dl>
        {order.fulfilment === "delivery" && (
          <p className="mt-3">
            Delivery address: {order.address}, {order.city}, {order.state}
          </p>
        )}
      </section>
    </div>
  );
}