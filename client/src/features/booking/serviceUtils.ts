import type { Service } from "../../shared";

export const CATEGORY_LABELS: Record<Service["category"], string> = {
  hair: "Hair",
  bridal: "Bridal",
  makeup: "Makeup",
  nails_feet: "Nails and feet",
};

// The order of the sections on the page
const CATEGORY_ORDER: Service["category"][] = ["hair", "makeup", "nails_feet", "bridal"];

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  return `${hours} hr ${rest} min`;
}

export type ServiceGroup = { category: Service["category"]; label: string; items: Service[] };

// Bridal services (flagged isBridal) go to the bridal section. The rest are grouped by category.
// Empty groups are left out
export function splitServices(services: Service[]): { groups: ServiceGroup[]; bridal: Service[] } {
  const regular = services.filter((service) => !service.isBridal);
  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    items: regular.filter((service) => service.category === category),
  })).filter((group) => group.items.length > 0);
  return { groups, bridal: services.filter((service) => service.isBridal) };
}