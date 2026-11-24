import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import type { CartItem } from "../../context/cart";
import { ApiError } from "../../lib/api";
import { productQueryOptions } from "../shop/queries";
import { resolveLine, type LiveLine } from "./bagCheck";

export function useBagLines(items: CartItem[]): LiveLine[] {
  // One request per product, even if the bag has three variants of it
  const slugs = useMemo(() => [...new Set(items.map((item) => item.productSlug))], [items]);

  const results = useQueries({
    // staleTime 0: always look again when the bag opens, because prices and stock change
    queries: slugs.map((slug) => ({ ...productQueryOptions(slug), staleTime: 0 })),
  });

  const bySlug = new Map(slugs.map((slug, index) => [slug, results[index]]));

  return items.map((item) => {
    const result = bySlug.get(item.productSlug);
    if (result?.data) return resolveLine(item, result.data);
    if (result?.isError) {
      const notFound = result.error instanceof ApiError && result.error.status === 404;
      return notFound ? resolveLine(item, null) : resolveLine(item, undefined, true);
    }
    return resolveLine(item, undefined); // still loading
  });
}