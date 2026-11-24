import { Link } from "react-router-dom";
import { naira } from "../../lib/format";
import type { LiveLine } from "./bagCheck";
import { subtotalKobo } from "./bagCheck";

type OrderSummaryProps = {
  lines: LiveLine[];
  fulfilment: "delivery" | "pickup";
  deliveryFeeKobo: number | null; // null = the customer has not chosen a state yet
};

export function OrderSummary({ lines, fulfilment, deliveryFeeKobo }: OrderSummaryProps) {
  const subtotal = subtotalKobo(lines);
  const total = subtotal + (deliveryFeeKobo ?? 0);
  const totalLabel = fulfilment === "delivery" && deliveryFeeKobo === null ? "Total before delivery" : "Total";

  return (
    <section aria-labelledby="summary-title" className="bg-sand p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="summary-title" className="text-2xl">
          Your order
        </h2>
        <Link to="/cart" className="text-gold-deep underline underline-offset-4">
          Edit bag
        </Link>
      </div>

      <ul className="mt-4 space-y-3">
        {lines
          .filter((line) => line.status !== "gone")
          .map((line) => (
            <li key={line.item.variantId} className="flex justify-between gap-4">
              <span>
                {line.item.qty} x {line.item.productName}
                {line.item.variantLabel ? ` (${line.item.variantLabel})` : ""}
              </span>
              <span className="shrink-0">{naira(line.priceKobo * line.item.qty)}</span>
            </li>
          ))}
      </ul>

      {/* role="status": a screen reader hears the fee and total change when the state changes */}
      <dl role="status" className="mt-5 space-y-2 border-t border-gold pt-4">
        <div className="flex justify-between gap-4">
          <dt>Subtotal</dt>
          <dd>{naira(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>{fulfilment === "pickup" ? "Pickup" : "Delivery"}</dt>
          <dd>
            {fulfilment === "pickup" ? "Free" : deliveryFeeKobo === null ? "Choose your state" : naira(deliveryFeeKobo)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-gold pt-3 text-lg font-medium">
          <dt>{totalLabel}</dt>
          <dd className="font-display text-2xl text-gold-deep">{naira(total)}</dd>
        </div>
      </dl>

      <p className="mt-3 text-sm">Prices and stock are checked again when your order is saved.</p>
    </section>
  );
}