import type { Product, Variant } from "../../shared";

export const ATTRIBUTES = ["lengthIn", "color", "density", "size"] as const;
export type AttributeKey = (typeof ATTRIBUTES)[number];
export type AttributeValue = string | number;

export const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  lengthIn: "Length",
  color: "Colour",
  density: "Density",
  size: "Size",
};

export type AttributeGroup = { key: AttributeKey; label: string; values: AttributeValue[] };

export function optionLabel(key: AttributeKey, value: AttributeValue): string {
  return key === "lengthIn" ? `${value} inch` : String(value);
}

// Splits a product's attributes into things the customer CHOOSES (more than one value)
// and things that are just FACTS (one value everywhere)
export function getAttributeGroups(product: Product): { choices: AttributeGroup[]; facts: AttributeGroup[] } {
  const choices: AttributeGroup[] = [];
  const facts: AttributeGroup[] = [];
  for (const key of ATTRIBUTES) {
    const values: AttributeValue[] = [];
    for (const variant of product.variants) {
      const value = variant[key];
      if (value !== null && !values.includes(value)) values.push(value);
    }
    if (key === "lengthIn") values.sort((a, b) => Number(a) - Number(b)); // 8 before 12
    const group = { key, label: ATTRIBUTE_LABELS[key], values };
    if (values.length > 1) choices.push(group);
    else if (values.length === 1) facts.push(group);
  }
  return { choices, facts };
}

// Start on something the customer can actually buy
export function pickDefaultVariant(product: Product): Variant | undefined {
  return product.variants.find((variant) => variant.stock > 0) ?? product.variants[0];
}

// A choice is available if at least one variant with that value is in stock
export function isOptionAvailable(product: Product, key: AttributeKey, value: AttributeValue): boolean {
  return product.variants.some((variant) => variant[key] === value && variant.stock > 0);
}

// The customer tapped (key = value). Find the closest real variant
export function selectOption(product: Product, current: Variant, key: AttributeKey, value: AttributeValue): Variant {
  const candidates = product.variants.filter((variant) => variant[key] === value);
  if (candidates.length === 0) return current;

  const others = ATTRIBUTES.filter((other) => other !== key);
  const score = (variant: Variant): number =>
    (variant.stock > 0 ? 100 : 0) + others.filter((other) => variant[other] === current[other]).length;

  // On a tie, the first one in the product's own order wins
  return candidates.reduce((best, variant) => (score(variant) > score(best) ? variant : best));
}