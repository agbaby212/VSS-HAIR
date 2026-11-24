import { z } from "zod";

export const CART_KEY = "vss_cart";
export const MAX_QTY_PER_ITEM = 20; // same limit as checkoutSchema (qty max 20)

// DISPLAY details only. The server recomputes every price at checkout
export const cartItemSchema = z.object({
  variantId: z.string().uuid(),
  productSlug: z.string(),
  productName: z.string(),
  variantLabel: z.string().nullable(),
  unitPriceKobo: z.number().int().min(0),
  imageUrl: z.string().nullable(),
  qty: z.number().int().min(1).max(MAX_QTY_PER_ITEM),
  maxQty: z.number().int().min(1).max(MAX_QTY_PER_ITEM), // stock we knew about when it was added
});

export type CartItem = z.infer<typeof cartItemSchema>;
export type NewCartItem = Omit<CartItem, "qty">;

export function addToCart(items: CartItem[], item: NewCartItem, qty: number): { items: CartItem[]; capped: boolean } {
  const cap = Math.min(item.maxQty, MAX_QTY_PER_ITEM);
  const existing = items.find((line) => line.variantId === item.variantId);

  if (!existing) {
    const next = Math.min(qty, cap);
    return { items: [...items, { ...item, maxQty: cap, qty: next }], capped: next < qty };
  }

  const wanted = existing.qty + qty;
  const next = Math.min(wanted, cap);
  return {
    // "...item" refreshes the name and price, so a re-added item shows today's price
    items: items.map((line) => (line.variantId === item.variantId ? { ...line, ...item, maxQty: cap, qty: next } : line)),
    capped: wanted > cap,
  };
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, line) => sum + line.qty, 0);
}

// Change one line's quantity, kept between 1 and 20. Ignores a quantity that is not a number
export function setItemQty(items: CartItem[], variantId: string, qty: number): CartItem[] {
  if (!Number.isFinite(qty)) return items;
  const next = Math.min(Math.max(Math.trunc(qty), 1), MAX_QTY_PER_ITEM);
  return items.map((line) => (line.variantId === variantId ? { ...line, qty: next } : line));
}

export function removeFromCart(items: CartItem[], variantId: string): CartItem[] {
  return items.filter((line) => line.variantId !== variantId);
}
// localStorage can be blocked (private mode) or hold junk. Neither may crash the shop
export function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = z.array(cartItemSchema).safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // storage full or blocked: the bag still works for this visit
  }
}