# FE-T4: Shop list and filters

Purpose: the `/shop` page, with filters that live in the URL, search, pagination and a sold-out display.

## What was built
- `client/src/pages/Shop.tsx` and route `shop` in `App.tsx`
- `features/shop/`: `shopFilters.ts` (URL <-> filters <-> API filters), `useShopFilters.ts`, `filterOptions.ts`, tests for both
- `components/shop/`: `CategoryChips`, `SearchForm`, `FilterPanel`, `Pagination`
- `components/ui/Select.tsx`
- `useProducts` now keeps the previous results while new ones load (`placeholderData: keepPreviousData`)
- `ProductCard` dims the photo of a sold-out product

## How other parts use it
- Link to a filtered shop: `/shop?category=wigs&texture=Straight&length=22&price=over-200k&q=lace&page=2`. All parts are optional
- URL parameters: `category`, `texture`, `color`, `length` (inches), `price` (`under-50k`, `50k-100k`, `100k-200k`, `over-200k`), `q`, `page`
- `parseFilters(params)` never throws. Bad values are dropped. `toSearchParams(filters)` omits page 1
- `toApiFilters(filters)` converts the price id to kobo `minPrice` and `maxPrice` and adds `pageSize: 12`
- `useShopFilters()` returns `{ filters, setFilters(patch), clearAll }`. Any patch without `page` resets to page 1
- `Select` (`label`, `value`, `onChange`, `options`, `anyLabel`) is reusable in admin forms
- `buildFilterOptions(products)` is a pure function. `useFilterOptions()` reads the first 50 products

## How to test it
`npm run test`, then use the checklist in the task file. To see pagination, temporarily set `PAGE_SIZE = 5` in `shopFilters.ts`.

## Assumptions and known limitations
- Dropdown options come from the first 50 products only (Q13)
- Search runs on Enter or the Search button, not on every keystroke (Q14)
- There is no sort menu: Section 6 has no sort parameter
- Colour names are matched exactly, so "Black" and "black" would be two options. The server matches case-insensitively when filtering
- Price ranges are fixed in code, not settings
- `PAGE_SIZE` is 12. The mock allows up to 50
- Page titles are not set yet (FE-T16)

## Related tasks
- Previous: [FE-T3](./FE-T3-homepage.md)
- Next: [FE-T5](./FE-T5-product-page.md)