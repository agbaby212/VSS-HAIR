import { useEffect, useState } from "react";
import { CategoryChips } from "../components/shop/CategoryChips";
import { FilterPanel } from "../components/shop/FilterPanel";
import { Pagination } from "../components/shop/Pagination";
import { ProductCard } from "../components/shop/ProductCard";
import { SearchForm } from "../components/shop/SearchForm";
import { Button } from "../components/ui/Button";
import { ErrorNotice } from "../components/ui/ErrorNotice";
import { useFilterOptions } from "../features/shop/filterOptions";
import { useProducts } from "../features/shop/queries";
import { hasAnyFilter, panelFilterCount, toApiFilters } from "../features/shop/shopFilters";
import { useShopFilters } from "../features/shop/useShopFilters";
import { whatsappChatUrl } from "../lib/whatsapp";

export default function Shop() {
  const { filters, setFilters, clearAll } = useShopFilters();
  const optionsQuery = useFilterOptions();
  const options = optionsQuery.data ?? { textures: [], colors: [], lengths: [] };
  const query = useProducts(toApiFilters(filters));
  const [panelOpen, setPanelOpen] = useState(false); // only used on phones

  // New page of results: start at the top
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [filters.page]);

  const products = query.data?.data ?? [];
  const meta = query.data?.meta;
  const panelCount = panelFilterCount(filters);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl">Shop hair</h1>
      <p className="mt-2 max-w-prose">
        Choose what you like, then send your order to us on WhatsApp. You pay by bank transfer after the owner replies.
      </p>

      <div className="mt-6 space-y-4">
        <CategoryChips value={filters.category} onChange={(category) => setFilters({ category })} />
        <SearchForm value={filters.q} onSearch={(q) => setFilters({ q })} />
      </div>

      <div className="mt-6 lg:grid lg:grid-cols-[15rem_1fr] lg:gap-10">
        <aside aria-label="Filters">
          <Button
            variant="secondary"
            className="lg:hidden"
            aria-expanded={panelOpen}
            aria-controls="filter-panel"
            onClick={() => setPanelOpen((open) => !open)}
          >
            {panelCount > 0 ? `Filters (${panelCount})` : "Filters"}
          </Button>
          <div id="filter-panel" className={`${panelOpen ? "mt-4 block" : "hidden"} lg:mt-0 lg:block`}>
            {optionsQuery.isError && (
              <ErrorNotice
                error={optionsQuery.error}
                onRetry={() => void optionsQuery.refetch()}
                title="We could not load filter options"
              />
            )}
            <FilterPanel filters={filters} options={options} onChange={setFilters} />
            {hasAnyFilter(filters) && (
              <Button variant="secondary" className="mt-5 w-full" onClick={clearAll}>
                Clear all filters
              </Button>
            )}
          </div>
        </aside>

        <section aria-label="Products" className="mt-6 lg:mt-0" aria-busy={query.isPlaceholderData}>
          {/* role="status" is read aloud when it changes, so screen reader users hear the new count */}
          <p role="status" className="mb-4">
            {meta ? `${meta.total} ${meta.total === 1 ? "product" : "products"}` : query.isPending ? "Loading products" : ""}
            {filters.q && meta ? ` for “${filters.q}”` : ""}
          </p>

          {query.isPending && (
            <div aria-hidden="true" className="grid grid-cols-2 gap-5 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="h-56 animate-pulse bg-sand" />
              ))}
            </div>
          )}

          {query.isError && (
            <ErrorNotice error={query.error} onRetry={() => void query.refetch()} title="We could not load the shop" />
          )}

          {meta && meta.total === 0 && (
            <div className="bg-sand p-6">
              <h2 className="text-2xl">No hair matches those filters</h2>
              <p className="mt-2 max-w-prose">
                Try removing a filter. Or{" "}
                <a href={whatsappChatUrl()} target="_blank" rel="noopener noreferrer" className="text-gold-deep underline underline-offset-4">
                  ask us on WhatsApp
                </a>{" "}
                and we will tell you if we can get it.
              </p>
              <Button className="mt-4" onClick={clearAll}>
                Clear all filters
              </Button>
            </div>
          )}

          {/* A link to a page that no longer exists (for example ?page=99) */}
          {meta && meta.total > 0 && products.length === 0 && (
            <div className="bg-sand p-6">
              <h2 className="text-2xl">That page is empty</h2>
              <Button className="mt-4" onClick={() => setFilters({ page: 1 })}>
                Go to the first page
              </Button>
            </div>
          )}

          {products.length > 0 && (
            <div className={`grid grid-cols-2 gap-5 transition-opacity lg:grid-cols-3 ${query.isPlaceholderData ? "opacity-60" : ""}`}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {meta && <Pagination page={filters.page} totalPages={meta.totalPages} onPage={(page) => setFilters({ page })} />}
        </section>
      </div>
    </div>
  );
}