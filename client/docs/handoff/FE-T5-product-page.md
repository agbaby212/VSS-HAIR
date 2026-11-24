# FE-T5: Product page

Purpose: the product page (gallery, variant choice, stock, add to bag, buy now, WhatsApp enquiry, reviews) and the cart foundation it needs.

## What was built
- Route `shop/:slug` -> `pages/ProductPage.tsx` -> `features/shop/ProductDetails.tsx`
- `features/shop/variantSelection.ts` (+ test): `getAttributeGroups`, `pickDefaultVariant`, `isOptionAvailable`, `selectOption`, `optionLabel`, `ATTRIBUTE_LABELS`
- `features/shop/reviewUtils.ts` (`averageRating`), `useProduct(slug)` in `queries.ts`, `variantLabel()` in `productUtils.ts`
- Cart foundation in `client/src/context/`: `cart.ts` (+ test), `cartContext.ts`, `CartContext.tsx` (`CartProvider`), `useCart.ts`
- `components/`: `ui/QuantityStepper`, `shop/ProductGallery`, `shop/VariantPicker`, `shop/ReviewSummary`
- Header shows the bag count ("Bag (2)")

## How other parts use it
- Read the bag: `const { items, count, addItem } = useCart()`. `items` are `CartItem[]` (`variantId`, `productSlug`, `productName`, `variantLabel`, `unitPriceKobo`, `imageUrl`, `qty`, `maxQty`)
- Add: `addItem({ variantId, productSlug, productName, variantLabel, unitPriceKobo, imageUrl, maxQty }, qty)` returns `"added"` or `"capped"`
- The bag is saved in `localStorage` under `vss_cart` and validated with Zod when loaded (bad data becomes an empty bag)
- `MAX_QTY_PER_ITEM` is 20 (same as `checkoutSchema`)
- Order lines for the API are `{ variantId, qty }` only. Prices in the bag are for display. The server recomputes them
- `QuantityStepper` (`value`, `max`, `onChange`) is reusable in the bag page
- `Buy now` adds the item then navigates to `/checkout`

## How to test it
`npm run test`, then the checklist in the task file (variants, sold out, add to bag, buy now, not found).

## Assumptions and known limitations
- FE-T6 must still add: bag page, change quantity, remove item, clear bag, totals, and re-checking prices and stock against the server. This task only adds items
- Reviews on the product page are business-wide, not per product (Q16)
- Attributes are assumed consistent per product (if some variants have no colour and others do, the colour group ignores the empty ones)
- A video has no still picture, so its thumbnail is a labelled sand circle
- The bag is per browser: it does not sync between tabs until reload
- Page titles are not set (FE-T16)

## Related tasks
- Previous: [FE-T4](./FE-T4-shop-list.md)
- Next: [FE-T6](./FE-T6-cart-and-checkout.md)