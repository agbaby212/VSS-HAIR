import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch, apiFetchPage } from "../../lib/api";
import {
  deliveryZoneSchema,
  productSchema,
  publicSettingsSchema,
  reviewSchema,
  type Product,
} from "../../shared";

export function useDeliveryZones() {
  return useQuery({
    queryKey: ["delivery-zones"], // Section 9
    queryFn: ({ signal }) => apiFetch("/delivery-zones", z.array(deliveryZoneSchema), { signal }),
  });
}

// Same names as the query string in Section 6. Money is in kobo, length in inches
export type ProductFilters = {
  category?: Product["category"];
  texture?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  length?: number;
  q?: string;
  page?: number;
  pageSize?: number;
};

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ["products", filters], // Section 9: after a mutation we invalidate this key
    queryFn: ({ signal }) =>
      apiFetchPage("/products", productSchema, { query: filters, signal }),
    placeholderData: keepPreviousData, // while a new page or filter loads, keep showing the old results. No empty flash
  });
}

export function useReviews() {
  return useQuery({
    queryKey: ["reviews"],
    queryFn: ({ signal }) => apiFetch("/reviews", z.array(reviewSchema), { signal }),
  });
}

export function usePublicSettings() {
  return useQuery({
    queryKey: ["settings", "public"],
    queryFn: ({ signal }) =>
      apiFetch("/settings/public", publicSettingsSchema, { signal }),
  });
}

export function productQueryOptions(slug: string) {
  return queryOptions({
    queryKey: ["product", slug], // Section 9
    queryFn: ({ signal }) =>
      apiFetch(`/products/${encodeURIComponent(slug)}`, productSchema, { signal }),
  });
}

export function useProduct(slug: string) {
  return useQuery(productQueryOptions(slug));
}