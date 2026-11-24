import { describe, expect, it } from "vitest";
import { addToCart, cartCount, removeFromCart, setItemQty, type CartItem, type NewCartItem } from "./cart";

const item: NewCartItem = {
  variantId: "00000002-0000-4000-8000-000000000001", productSlug: "wig", productName: "Wig",
  variantLabel: "22 inch", unitPriceKobo: 100, imageUrl: null, maxQty: 3,
};

describe("addToCart", () => {
  it("adds a new line", () => {
    const result = addToCart([], item, 2);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].qty).toBe(2);
    expect(result.capped).toBe(false);
  });

  it("adds to the same variant instead of making a second line", () => {
    const first = addToCart([], item, 1).items;
    const second = addToCart(first, item, 1);
    expect(second.items).toHaveLength(1);
    expect(second.items[0].qty).toBe(2);
  });

  it("never goes above the stock we know about, and says so", () => {
    const start: CartItem[] = [{ ...item, qty: 2 }];
    const result = addToCart(start, item, 5);
    expect(result.items[0].qty).toBe(3);
    expect(result.capped).toBe(true);
  });

  it("never goes above 20 even with lots of stock", () => {
    const result = addToCart([], { ...item, maxQty: 20 }, 25);
    expect(result.items[0].qty).toBe(20);
    expect(result.capped).toBe(true);
  });
});

describe("cartCount", () => {
  it("adds up the quantities", () => {
    expect(cartCount([{ ...item, qty: 2 }, { ...item, variantId: "00000002-0000-4000-8000-000000000002", qty: 3 }])).toBe(5);
  });
});

describe("setItemQty", () => {
  const start: CartItem[] = [
    { ...item, qty: 2 },
    { ...item, variantId: "00000002-0000-4000-8000-000000000002", qty: 1 },
  ];

  it("changes only the chosen line", () => {
    const result = setItemQty(start, item.variantId, 5);
    expect(result[0].qty).toBe(5);
    expect(result[1].qty).toBe(1);
  });

  it("keeps the quantity between 1 and 20", () => {
    expect(setItemQty(start, item.variantId, 0)[0].qty).toBe(1);
    expect(setItemQty(start, item.variantId, 99)[0].qty).toBe(20);
  });

  it("ignores a number that is not real", () => {
    expect(setItemQty(start, item.variantId, Number.NaN)).toEqual(start);
  });
});

describe("removeFromCart", () => {
  it("removes only that variant", () => {
    const start: CartItem[] = [
      { ...item, qty: 2 },
      { ...item, variantId: "00000002-0000-4000-8000-000000000002", qty: 1 },
    ];
    expect(removeFromCart(start, item.variantId).map((line) => line.variantId)).toEqual(["00000002-0000-4000-8000-000000000002"]);
  });
});