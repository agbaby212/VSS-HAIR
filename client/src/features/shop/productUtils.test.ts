import { describe, expect, it } from "vitest";
import type { Product } from "../../shared";
import { fromPriceKobo, isSoldOut } from "./productUtils";

function product(variants: { priceKobo: number; stock: number }[]): Product {
  return {
    id: "00000001-0000-4000-8000-000000000001", slug: "test", name: "Test", category: "wigs", texture: null,
    description: null, media: [], isActive: true,
    variants: variants.map((v, i) => ({
      id: `00000002-0000-4000-8000-00000000000${i}`, productId: "00000001-0000-4000-8000-000000000001",
      sku: null, lengthIn: null, color: null, density: null, size: null, isActive: true, ...v,
    })),
  };
}

describe("isSoldOut", () => {
  it("is true only when every variant has no stock", () => {
    expect(isSoldOut(product([{ priceKobo: 100, stock: 0 }, { priceKobo: 200, stock: 0 }]))).toBe(true);
    expect(isSoldOut(product([{ priceKobo: 100, stock: 0 }, { priceKobo: 200, stock: 1 }]))).toBe(false);
  });
});

describe("fromPriceKobo", () => {
  it("ignores sold-out variants", () => {
    expect(fromPriceKobo(product([{ priceKobo: 100, stock: 0 }, { priceKobo: 300, stock: 2 }, { priceKobo: 200, stock: 5 }]))).toBe(200);
  });
  it("falls back to the lowest price when all are sold out", () => {
    expect(fromPriceKobo(product([{ priceKobo: 500, stock: 0 }, { priceKobo: 400, stock: 0 }]))).toBe(400);
  });
});