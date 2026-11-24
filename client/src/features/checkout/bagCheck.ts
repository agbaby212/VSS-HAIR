import type { CartItem } from "../../context/cart";
import type { Product } from "../../shared";

export type LiveLine = {
  item: CartItem;
  status: "checking" | "ok" | "gone" | "unchecked";
  priceKobo: number; // live price when we know it, otherwise the saved one
  stock: number | null; // live stock when we know it
  priceChanged: boolean;
  tooMany: boolean; // the bag asks for more than the shop has (this includes sold out)
};

// product: undefined = still loading, null = the shop says it does not exist, otherwise the live product
// failed: we could not ask at all (network or server error)
export function resolveLine(item: CartItem, product: Product | null | undefined, failed = false): LiveLine {
  const base: Omit<LiveLine, "status"> = { item, priceKobo: item.unitPriceKobo, stock: null, priceChanged: false, tooMany: false };
  if (failed) return { ...base, status: "unchecked" };
  if (product === undefined) return { ...base, status: "checking" };

  // The API only returns active variants, so a missing variant means it is gone
  const variant = product?.variants.find((candidate) => candidate.id === item.variantId);
  if (!variant) return { ...base, status: "gone" };

  return {
    item,
    status: "ok",
    priceKobo: variant.priceKobo,
    stock: variant.stock,
    priceChanged: variant.priceKobo !== item.unitPriceKobo,
    tooMany: item.qty > variant.stock,
  };
}

export function canCheckout(lines: LiveLine[]): boolean {
  return lines.length > 0 && lines.every((line) => line.status === "unchecked" || (line.status === "ok" && !line.tooMany));
}

// What the bag will cost, using live prices. A removed item is not counted
export function subtotalKobo(lines: LiveLine[]): number {
  return lines.filter((line) => line.status !== "gone").reduce((sum, line) => sum + line.priceKobo * line.item.qty, 0);
}