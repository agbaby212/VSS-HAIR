# FE-T8: Static pages

Purpose: the public information pages (Services and Bridal, Delivery and Returns, Contact, Gallery, About, FAQ), plus pickup wording on order tracking (CCR-3).

## What was built
- Routes `services`, `delivery`, `contact`, `gallery`, `about`, `faq`
- `pages/`: `Services`, `DeliveryReturns`, `Contact`, `Gallery`, `About`, `FAQ`
- `features/booking/`: `queries.ts` (`useServices`, `useTravelZones`), `serviceUtils.ts` (`formatDuration`, `splitServices`, `CATEGORY_LABELS`), `BridalInfo`, `HomeVisitInfo`
- `components/booking/`: `ServiceRow`, `PackagePanel`
- `features/shop/StateFeeChecker.tsx`
- `lib/gallery.ts` (gallery list, `parseGalleryCategory`, `filterGallery`), `features/gallery/Lightbox.tsx`
- `features/faq/faqItems.tsx` (`faqGroups(settings)`)
- `components/ui/ChipGroup.tsx`, `lib/useScrollToHash.ts`
- CCR-3: `trackedOrderSchema.fulfilment`, `CONTRACT_VERSION` `1.1.0`, `statusLabel(status, fulfilment)` in `orderStatus.ts`

## How other parts use it
- Services for the booking wizard: `const { data } = useServices()` returns `{ services, packages }`. `useTravelZones()` returns the home-visit areas. Book links already use `/book?service=<id>` and `/book?package=<id>`: FE-T9 must read those parameters
- `formatDuration(minutes)` gives "1 hr 30 min". `splitServices(services)` gives `{ groups, bridal }`
- Link to a section of the Services page: `/services#bridal` or `/services#home-visits` (scrolls after the data loads)
- `ChipGroup<T>` for any row of filter buttons (`label`, `options`, `value`, `onChange`)
- `statusLabel(status, fulfilment)` for customer status words (pickup says "Ready for pickup" and "Collected")
- To add a gallery photo: copy the file to `client/public/photos/`, set `src` in `lib/gallery.ts`, and fix the alt text
- FAQ and About read the same public settings the booking and checkout use (hold hours, deposit percent, notice hours, cancellation policy)

## How to test it
`npm run test`, then the checklists in both task files. For tracking, use the `set(status, extra)` console helper from FE-T7.

## Assumptions and known limitations
- Gallery has no photos yet (sand circles). It is a plain list in `lib/gallery.ts`, not an admin screen and not in the contract
- Returns policy, About story, contact details, opening hours and social links are `[REPLACE]` and must come from the owner
- The Gallery large view uses the browser's `<dialog>`. `backdrop:` styling needs Tailwind 3.1 or newer
- `CategoryChips` (shop) was not refactored to use `ChipGroup`
- FAQ answers mention the checkout and booking steps as they will be after FE-T9 (button names "Send order on WhatsApp" and "Send booking on WhatsApp")
- Page titles (`document.title`) are not set (FE-T16)

## Related tasks
- Previous: [FE-T7](./FE-T7-order-page-and-tracking.md)
- Next: [FE-T9](./FE-T9-booking-wizard.md)