# FE-T3: Homepage with real photos

Purpose: the public homepage, plus the data hooks and shop helpers that later shop pages reuse.

## What was built
- `client/src/pages/Home.tsx` using `Hero`, `CategoryCircles`, `PopularProducts`, `BridalBand`, `ReviewsSection`
- `client/src/lib/photos.ts`: the site's photo list (file, alt, size)
- `client/src/features/shop/`: `queries.ts` (`useProducts`, `useReviews`, `usePublicSettings`), `categories.ts`, `productUtils.ts` (+ test)
- `client/src/components/`: `hero/Hero`, `hero/HeroCircles`, `shop/CategoryCircles`, `shop/ProductCard`, `ui/ErrorNotice`, `ui/Stars`
- `client/src/features/home/`: `PopularProducts`, `BridalBand`, `ReviewsSection`
- `Photo` now has `priority` (eager loading) and hides its placeholder from screen readers
- `.settle` animation in `index.css`

## How other parts use it
- Products: `const { data, isPending, isError, error, refetch } = useProducts({ category: "wigs", page: 1, pageSize: 12 })`. `data.data` is the list and `data.meta` the paging. Filters match Section 6 (money in kobo, length in inches)
- One product page will use `["product", slug]` (FE-T5). Reviews use `["reviews"]`. Settings use `["settings", "public"]`
- `ProductCard` (`product`, `featured?`) is reusable in the shop list (FE-T4)
- `isSoldOut(product)` and `fromPriceKobo(product)` for sold-out display and "From ₦X"
- `ErrorNotice` for every page's error state: `<ErrorNotice error={error} onRetry={() => void refetch()} />`
- `categories` gives value and label for filters. The homepage links to `/shop?category=<value>`, so FE-T4 must read the `category` query parameter
- Photos: add the file to `client/public/photos/`, set `src` in `lib/photos.ts`, update the alt text
- `<Photo priority />` only for the one big image at the top of a page

## How to test it
`npm run test`, then `npm run dev` and use the acceptance checklist in the task file (360px, reduced motion, slow network, error state).

## Assumptions and known limitations
- "From the shop" shows the first in-stock products. The API has no best-seller or featured field (see Q10)
- Product photos come from `product.media` (empty in the mock), so cards show the sand placeholder until FE-T13 uploads real ones
- Category circle photos use empty alt text because the text label names the link
- The sample reviews ("Sample customer A to D") are mock text and must be replaced by real reviews
- The bridal band links to `/services` until the booking wizard (FE-T9) has a bridal entry point
- Page titles (`document.title`) are not set yet. FE-T16 covers it
- Section folder `features/home/` was added (not named in Section 8)

## Related tasks
- Previous: [FE-T2](./FE-T2-contract-api-mocks.md)
- Next: [FE-T4](./FE-T4-shop-list-and-filters.md)