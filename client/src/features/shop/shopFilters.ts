import { z } from "zod";
import { naira } from "../../lib/format";
import { PRODUCT_CATEGORIES } from "../../shared";
import type { ProductFilters } from "./queries";

export const PAGE_SIZE = 12;

// Price ranges, in NAIRA here for readability. They become kobo in toApiFilters
export const PRICE_IDS = ["under-50k", "50k-100k", "100k-200k", "over-200k"] as const;
export type PriceId = (typeof PRICE_IDS)[number];

const PRICE_BOUNDS: Record<PriceId, { min?: number; max?: number }> = {
  "under-50k": { max: 49_999 },
  "50k-100k": { min: 50_000, max: 99_999 },
  "100k-200k": { min: 100_000, max: 199_999 },
  "over-200k": { min: 200_000 },
};

// The text shown in the Price dropdown. Money is formatted by naira(), which expects kobo
export function priceLabel(id: PriceId): string {
  const { min, max } = PRICE_BOUNDS[id];
  if (min === undefined && max !== undefined) return `Under ${naira((max + 1) * 100)}`;
  if (max === undefined && min !== undefined) return `${naira(min * 100)} and above`;
  return `${naira((min ?? 0) * 100)} to ${naira((max ?? 0) * 100)}`;
}

// What the address bar can contain. Every field falls back safely if the value is bad
const urlSchema = z.object({
  category: z.enum(PRODUCT_CATEGORIES).optional().catch(undefined),
  texture: z.string().trim().min(1).max(40).optional().catch(undefined),
  color: z.string().trim().min(1).max(40).optional().catch(undefined),
  length: z.coerce.number().int().min(1).max(60).optional().catch(undefined),
  price: z.enum(PRICE_IDS).optional().catch(undefined),
  q: z.string().trim().min(1).max(80).optional().catch(undefined),
  page: z.coerce.number().int().min(1).catch(1),
});

export type ShopFilters = z.infer<typeof urlSchema>;

export function parseFilters(params: URLSearchParams): ShopFilters {
  // Never throws: every field has a .catch. Unknown keys are dropped
  return urlSchema.parse(Object.fromEntries(params));
}

export function toSearchParams(filters: ShopFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.texture) params.set("texture", filters.texture);
  if (filters.color) params.set("color", filters.color);
  if (filters.length) params.set("length", String(filters.length));
  if (filters.price) params.set("price", filters.price);
  if (filters.q) params.set("q", filters.q);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
}

// The server's filters (Section 6). Money in kobo
export function toApiFilters(filters: ShopFilters): ProductFilters {
  const bounds = filters.price ? PRICE_BOUNDS[filters.price] : undefined;
  return {
    category: filters.category,
    texture: filters.texture,
    color: filters.color,
    length: filters.length,
    q: filters.q,
    minPrice: bounds?.min === undefined ? undefined : bounds.min * 100,
    maxPrice: bounds?.max === undefined ? undefined : bounds.max * 100,
    page: filters.page,
    pageSize: PAGE_SIZE,
  };
}

// The filters in the side panel (the category buttons and the search box are shown separately)
export function panelFilterCount(filters: ShopFilters): number {
  return [filters.texture, filters.color, filters.length, filters.price].filter((value) => value !== undefined).length;
}

export function hasAnyFilter(filters: ShopFilters): boolean {
  return panelFilterCount(filters) > 0 || filters.category !== undefined || filters.q !== undefined;
}