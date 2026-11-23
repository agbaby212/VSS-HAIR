import { describe, expect, it } from "vitest";
import type { Product } from "../../shared";
import { buildFilterOptions } from "./filterOptions";

function product(texture: string | null, variants: { color: string | null; lengthIn: number | null }[]): Product {
  return {
    id: "00000001-0000-4000-8000-000000000001", slug: "t", name: "T", category: "wigs", texture, description: null,
    media: [], isActive: true,
    variants: variants.map((v, i) => ({
      id: `00000002-0000-4000-8000-00000000000${i}`, productId: "00000001-0000-4000-8000-000000000001", sku: null,
      density: null, size: null, priceKobo: 100, stock: 1, isActive: true, ...v,
    })),
  };
}

describe("buildFilterOptions", () => {
  it("collects unique values, skips empty ones and sorts lengths as numbers", () => {
    const options = buildFilterOptions([
      product("Straight", [{ color: "Black", lengthIn: 16 }, { color: "Black", lengthIn: 8 }]),
      product("Body wave", [{ color: null, lengthIn: 12 }]),
      product(null, [{ color: "Burgundy", lengthIn: null }]),
    ]);
    expect(options.textures).toEqual(["Body wave", "Straight"]);
    expect(options.colors).toEqual(["Black", "Burgundy"]);
    expect(options.lengths).toEqual([8, 12, 16]);
  });
});