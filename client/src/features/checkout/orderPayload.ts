import type { CartItem } from "../../context/cart";
import type { CheckoutInput, DeliveryZone } from "../../shared";

// The exact body of POST /orders. Money is not in it: the server recomputes every price (Section 10.4).
// For pickup, any address the customer typed and then abandoned is dropped
export function buildOrderPayload(data: CheckoutInput, items: Pick<CartItem, "variantId" | "qty">[]): CheckoutInput {
  const pickup = data.fulfilment === "pickup";
  return {
    customerName: data.customerName,
    phone: data.phone,
    email: data.email,
    fulfilment: data.fulfilment,
    state: pickup ? undefined : data.state,
    city: pickup ? undefined : data.city,
    address: pickup ? undefined : data.address,
    notes: data.notes,
    items: items.map(({ variantId, qty }) => ({ variantId, qty })),
  };
}

// "1 day", "3 days", "2 to 5 days"
export function deliveryEtaText(zone: Pick<DeliveryZone, "etaDaysMin" | "etaDaysMax">): string {
  const { etaDaysMin: min, etaDaysMax: max } = zone;
  const unit = max === 1 ? "day" : "days";
  return min === max ? `${max} ${unit}` : `${min} to ${max} ${unit}`;
}