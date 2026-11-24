import { createOrderResponseSchema, type CreateOrderResponse } from "../../shared";

const KEY = "vss_last_order";

// sessionStorage is wiped when the tab closes, which is right for a page holding a phone number and an address.
// The confirmation page needs this so a refresh does not lose the "Open WhatsApp" link
export function saveLastOrder(result: CreateOrderResponse): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(result));
  } catch {
    // storage blocked: the confirmation page will simply say it cannot show the order
  }
}

export function loadLastOrder(): CreateOrderResponse | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = createOrderResponseSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}