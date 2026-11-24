import { describe, expect, it } from "vitest";
import type { Product, Variant } from "../../shared";
import { getAttributeGroups, isOptionAvailable, pickDefaultVariant, selectOption } from "./variantSelection";

function make(specs: { lengthIn: number | null; color: string | null; stock: number }[]): Product {
  const productId = "00000001-0000-4000-8000-000000000001";
  const variants: Variant[] = specs.map((s, i) => ({
    id: `00000002-0000-4000-8000-00000000000${i}`, productId, sku: null, density: null, size: null,
    priceKobo: 100, isActive: true, ...s,
  }));
  return { id: productId, slug: "t", name: "T", category: "wigs", texture: null, description: null, media: [], isActive: true, variants };
}

const wig = make([
  { lengthIn: 22, color: "Black", stock: 1 },
  { lengthIn: 26, color: "Black", stock: 1 },
  { lengthIn: 26, color: "Honey", stock: 1 },
]);

describe("getAttributeGroups", () => {
  it("makes choices from attributes with several values and facts from single ones", () => {
    const { choices, facts } = getAttributeGroups(wig);
    expect(choices.map((g) => g.key)).toEqual(["lengthIn", "color"]);
    expect(choices[0].values).toEqual([22, 26]);
    expect(facts).toEqual([]);

    const oneColour = make([{ lengthIn: 8, color: "Black", stock: 1 }, { lengthIn: 12, color: "Black", stock: 1 }]);
    expect(getAttributeGroups(oneColour).facts.map((g) => g.key)).toEqual(["color"]);
  });

  it("sorts lengths as numbers", () => {
    const product = make([{ lengthIn: 12, color: null, stock: 1 }, { lengthIn: 8, color: null, stock: 1 }, { lengthIn: 16, color: null, stock: 1 }]);
    expect(getAttributeGroups(product).choices[0].values).toEqual([8, 12, 16]);
  });
});

describe("pickDefaultVariant", () => {
  it("skips a sold-out first variant", () => {
    const product = make([{ lengthIn: 8, color: null, stock: 0 }, { lengthIn: 12, color: null, stock: 2 }]);
    expect(pickDefaultVariant(product)?.lengthIn).toBe(12);
  });
  it("still returns something when everything is sold out", () => {
    expect(pickDefaultVariant(make([{ lengthIn: 8, color: null, stock: 0 }]))?.lengthIn).toBe(8);
  });
});

describe("selectOption", () => {
  it("keeps the other choices when a real combination exists", () => {
    const from22Black = wig.variants[0];
    const result = selectOption(wig, from22Black, "lengthIn", 26);
    expect(result.color).toBe("Black"); // 26 Black matches the current colour, 26 Honey does not
  });

  it("jumps to the only real combination when the exact one does not exist", () => {
    const from22Black = wig.variants[0];
    expect(selectOption(wig, from22Black, "color", "Honey").lengthIn).toBe(26);
  });

  it("prefers an in-stock variant over a better match that is sold out", () => {
    const product = make([
      { lengthIn: 22, color: "Black", stock: 1 },
      { lengthIn: 26, color: "Black", stock: 0 },
      { lengthIn: 26, color: "Honey", stock: 1 },
    ]);
    expect(selectOption(product, product.variants[0], "lengthIn", 26).color).toBe("Honey");
  });
});

describe("isOptionAvailable", () => {
  it("is false when every variant with that value is sold out", () => {
    const product = make([{ lengthIn: 24, color: null, stock: 0 }, { lengthIn: 20, color: null, stock: 3 }]);
    expect(isOptionAvailable(product, "lengthIn", 24)).toBe(false);
    expect(isOptionAvailable(product, "lengthIn", 20)).toBe(true);
  });
});