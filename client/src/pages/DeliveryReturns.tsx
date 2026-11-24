import { Link } from "react-router-dom";
import { StateFeeChecker } from "../features/shop/StateFeeChecker";
import { usePublicSettings } from "../features/shop/queries";

export default function DeliveryReturns() {
  const { data: settings } = usePublicSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl">Delivery and returns</h1>

      <section aria-labelledby="how-title" className="mt-8">
        <h2 id="how-title" className="text-3xl">How delivery works</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>At checkout, choose Delivery and your state. You see the fee and the estimated time before you send your order.</li>
          <li>Send your order to us on WhatsApp. The owner replies with her account details.</li>
          <li>Pay by bank transfer. She marks your order paid and gets it ready.</li>
          <li>
            When it ships, the courier tracking number shows on the{" "}
            <Link to="/track" className="text-gold-deep underline underline-offset-4">tracking page</Link>.
          </li>
        </ol>
      </section>

      <section aria-labelledby="fees-title" className="mt-10">
        <h2 id="fees-title" className="text-3xl">Fees and delivery times</h2>
        <div className="mt-3">
          <StateFeeChecker />
        </div>
        <p className="mt-3 max-w-prose text-sm">[REPLACE] Say when the delivery time starts counting: from the day payment is confirmed, or from the day the order ships.</p>
      </section>

      <section aria-labelledby="pickup-title" className="mt-10">
        <h2 id="pickup-title" className="text-3xl">Pickup</h2>
        <p className="mt-3 max-w-prose">You can collect your order yourself. There is no delivery fee.</p>
        <p className="mt-2">Collect from: {settings?.business.address ?? "..."}</p>
        <p className="mt-1">Opening hours: {settings?.business.hoursText ?? "..."}</p>
      </section>

      <section aria-labelledby="safe-title" className="mt-10">
        <h2 id="safe-title" className="text-3xl">Paying safely</h2>
        <p className="mt-3 max-w-prose">
          You pay only by bank transfer, to the account details the owner gives you in your WhatsApp chat about your order. This site never
          takes payment and never asks for card details. If anyone else asks you to pay, message us first.
        </p>
      </section>

      <section aria-labelledby="returns-title" className="mt-10">
        <h2 id="returns-title" className="text-3xl">Returns and exchanges</h2>
        <div className="mt-3 max-w-prose border-l-4 border-gold-deep pl-4">
          <p>[REPLACE] The owner writes her return and exchange rules here. They must answer:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>[REPLACE] How many days does the customer have to ask for a return or exchange?</li>
            <li>[REPLACE] What condition must the hair be in (unworn, uncut, unwashed, in its packaging)?</li>
            <li>[REPLACE] Which items cannot be returned?</li>
            <li>[REPLACE] Who pays for sending it back, and when is a refund paid?</li>
            <li>[REPLACE] How does the customer start? (For example: message us on WhatsApp with the order number.)</li>
          </ul>
        </div>
      </section>
    </div>
  );
}