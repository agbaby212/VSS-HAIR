import { describe, expect, it } from "vitest";
import type { CartItem } from "../../context/cart";
import type { Product } from "../../shared";
import { canCheckout, resolveLine, subtotalKobo } from "./bagCheck";

const variantId = "00000002-0000-4000-8000-000000000001";
const item: CartItem = {
  variantId, productSlug: "wig", productName: "Wig", variantLabel: "22 inch", unitPriceKobo: 1000, imageUrl: null, qty: 2, maxQty: 5,
};

function product(price: number, stock: number): Product {
  return {
    id: "00000001-0000-4000-8000-000000000001", slug: "wig", name: "Wig", category: "wigs", texture: null, description: null,
    media: [], isActive: true,
    variants: [{ id: variantId, productId: "00000001-0000-4000-8000-000000000001", sku: null, lengthIn: 22, color: null, density: null, size: null, priceKobo: price, stock, isActive: true }],
  };
}

describe("resolveLine", () => {
  it("is checking while the product loads", () => {
    expect(resolveLine(item, undefined).status).toBe("checking");
  });
  it("uses the live price and notices a change", () => {
    const line = resolveLine(item, product(1500, 5));
    expect(line).toMatchObject({ status: "ok", priceKobo: 1500, priceChanged: true, tooMany: false });
  });
  it("flags a quantity above the live stock, including sold out", () => {
    expect(resolveLine(item, product(1000, 1)).tooMany).toBe(true);
    expect(resolveLine(item, product(1000, 0)).tooMany).toBe(true);
  });
  it("is gone when the product is missing or the variant was removed", () => {
    expect(resolveLine(item, null).status).toBe("gone");
    expect(resolveLine({ ...item, variantId: "00000002-0000-4000-8000-000000000009" }, product(1000, 5)).status).toBe("gone");
  });
  it("is unchecked when we could not ask", () => {
    expect(resolveLine(item, undefined, true).status).toBe("unchecked");
  });
});

describe("canCheckout", () => {
  it("needs at least one line", () => {
    expect(canCheckout([])).toBe(false);
  });
  it("waits while checking and blocks gone or too many", () => {
    expect(canCheckout([resolveLine(item, undefined)])).toBe(false);
    expect(canCheckout([resolveLine(item, null)])).toBe(false);
    expect(canCheckout([resolveLine(item, product(1000, 1))])).toBe(false);
  });
  it("allows good lines and unchecked lines", () => {
    expect(canCheckout([resolveLine(item, product(1000, 5))])).toBe(true);
    expect(canCheckout([resolveLine(item, undefined, true)])).toBe(true);
  });
});

describe("subtotalKobo", () => {
  it("uses live prices and skips removed products", () => {
    const lines = [resolveLine(item, product(1500, 5)), resolveLine({ ...item, variantId: "00000002-0000-4000-8000-000000000009" }, null)];
    expect(subtotalKobo(lines)).toBe(3000); // 1500 x 2, the gone line adds nothing
  });
});