import { Link, useParams } from "react-router-dom";
import { buttonClasses } from "../components/ui/buttonClasses";
import { loadLastOrder } from "../features/checkout/lastOrder";
import { naira } from "../lib/format";
import { isWhatsappUrl } from "../lib/whatsapp";

export default function OrderConfirmation() {
  const { orderNumber = "" } = useParams();
  const saved = loadLastOrder();

  // A new tab, a closed tab, or a link someone sent: we do not keep orders in the browser for long
  if (!saved || saved.order.orderNumber !== orderNumber) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl">We cannot show that order here</h1>
        <p className="mt-3 max-w-prose">Use your order number and phone number to check on it.</p>
        <Link to="/track" className={`${buttonClasses()} mt-6`}>Track an order</Link>
      </section>
    );
  }

  const { order, whatsappUrl } = saved;
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl">Your order is saved</h1>
      <p className="mt-3 text-lg">
        Order number: <strong>{order.orderNumber}</strong>. Total: <strong>{naira(order.totalKobo)}</strong>.
      </p>
      <p className="mt-3 max-w-prose">
        Send the message in WhatsApp, then wait for the owner's reply with her account details. Pay by bank transfer after that.
      </p>
      {isWhatsappUrl(whatsappUrl) && (
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={`${buttonClasses({ size: "lg" })} mt-6`}>
          Open WhatsApp
        </a>
      )}
    </section>
  );
}