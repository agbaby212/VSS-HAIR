import { useQuery } from "@tanstack/react-query";
import { apiFetchPage } from "../../lib/api";
import { productSchema } from "../../shared";
import type { Product } from "../../shared";

export type FilterOptions = {
  textures: string[];
  colors: string[];
  lengths: number[];
};

export function buildFilterOptions(products: readonly Product[]): FilterOptions {
  const textures = new Set<string>();
  const colors = new Set<string>();
  const lengths = new Set<number>();

  for (const product of products) {
    if (product.texture?.trim()) textures.add(product.texture);

    for (const variant of product.variants) {
      if (variant.color?.trim()) colors.add(variant.color);
      if (variant.lengthIn !== null) lengths.add(variant.lengthIn);
    }
  }

  return {
    textures: [...textures].sort((a, b) => a.localeCompare(b)),
    colors: [...colors].sort((a, b) => a.localeCompare(b)),
    lengths: [...lengths].sort((a, b) => a - b),
  };
}

export function useFilterOptions() {
  return useQuery({
    queryKey: ["products", "filter-options"],
    queryFn: async ({ signal }) => {
      const pageSize = 50;
      const firstPage = await apiFetchPage("/products", productSchema, {
        query: { page: 1, pageSize },
        signal,
      });
      const products = [...firstPage.data];

      for (let page = 2; page <= firstPage.meta.totalPages; page += 1) {
        const nextPage = await apiFetchPage("/products", productSchema, {
          query: { page, pageSize },
          signal,
        });
        products.push(...nextPage.data);
      }

      return buildFilterOptions(products);
    },
  });
}
