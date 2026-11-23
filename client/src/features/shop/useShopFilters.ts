import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { parseFilters, toSearchParams, type ShopFilters } from "./shopFilters";

export function useShopFilters() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(params), [params]);

  // Change one or more filters. Passing undefined removes a filter
  const setFilters = useCallback(
    (patch: Partial<ShopFilters>) => {
      const next: ShopFilters = { ...filters, ...patch };
      // Any change except paging itself sends the customer back to page 1
      if (!("page" in patch)) next.page = 1;
      setParams(toSearchParams(next));
    },
    [filters, setParams],
  );

  const clearAll = useCallback(() => setParams(new URLSearchParams()), [setParams]);

  return { filters, setFilters, clearAll };
}