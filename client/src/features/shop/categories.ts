import type { Product } from "../../shared";

export type CategoryValue = Product["category"];

// The order here is the order on the page
export const categories: { value: CategoryValue; label: string }[] = [
  { value: "bundles", label: "Bundles" },
  { value: "frontals_closures", label: "Frontals and closures" },
  { value: "wigs", label: "Wigs" },
  { value: "extensions", label: "Extensions" },
  { value: "hair_care", label: "Hair care" },
];