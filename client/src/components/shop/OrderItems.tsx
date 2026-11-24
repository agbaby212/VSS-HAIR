import { naira } from "../../lib/format";
import type { OrderItem } from "../../shared";

// Prices here are the ones the server saved with the order
export function OrderItems({ items }: { items: OrderItem[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={`${item.productName}-${item.variantLabel ?? ""}-${index}`} className="flex justify-between gap-4">
          <span>
            {item.qty} x {item.productName}
            {item.variantLabel ? ` (${item.variantLabel})` : ""}
          </span>
          <span className="shrink-0">{naira(item.unitPriceKobo * item.qty)}</span>
        </li>
      ))}
    </ul>
  );
}