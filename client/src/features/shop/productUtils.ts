import type { Product } from "../../shared";

export function isSoldOut(product: Product): boolean {
  return product.variants.every((variant) => variant.stock === 0);
}

// The lowest price a customer can actually buy today (in kobo).
// If everything is sold out we fall back to the lowest listed price
export function fromPriceKobo(product: Product): number {
  const inStock = product.variants.filter((variant) => variant.stock > 0);
  const pool = inStock.length > 0 ? inStock : product.variants;
  if (pool.length === 0) return 0;
  return Math.min(...pool.map((variant) => variant.priceKobo));
}
import type { Variant } from "../../shared";

// "22 inch, Natural black" or null when a variant has no details (like a single hair-care item)
export function variantLabel(variant: Variant): string | null {
  const parts = [variant.lengthIn ? `${variant.lengthIn} inch` : null, variant.color, variant.density, variant.size].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}