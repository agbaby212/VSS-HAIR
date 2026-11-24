# FE-T6: Cart and checkout

Purpose: the bag page, the checkout form, and the hand-off of an order to the owner on WhatsApp.

## What was built
- Routes `cart`, `checkout`, `order/:orderNumber` (the last one is a temporary page, see below)
- `context/cart.ts`: `setItemQty`, `removeFromCart`. `useCart()` now also has `setQty`, `removeItem`, `clear`
- `features/checkout/`: `bagCheck.ts` (`resolveLine`, `canCheckout`, `subtotalKobo`, `LiveLine`), `useBagLines.ts`, `BagLine.tsx`, `OrderSummary.tsx`, `CheckoutForm.tsx`, `orderPayload.ts` (`buildOrderPayload`, `deliveryEtaText`), `lastOrder.ts`
- `pages/CartPage.tsx`, `pages/Checkout.tsx`, `pages/OrderConfirmation.tsx` (temporary)
- `components/ui/FormFields.tsx`: `TextField`, `TextAreaField`, `SelectField`
- `lib/zodMessages.ts`: friendly Zod messages for the whole app (imported once in `main.tsx`)
- `useDeliveryZones()` in `features/shop/queries.ts`, `isWhatsappUrl()` in `lib/whatsapp.ts`, `productQueryOptions(slug)`

## How other parts use it
- Bag: `const { items, count, addItem, setQty, removeItem, clear } = useCart()`
- Live bag lines: `const lines = useBagLines(items)` returns `LiveLine[]` with `status` (`checking | ok | gone | unchecked`), live `priceKobo`, `stock`, `priceChanged`, `tooMany`
- Order request: `POST /orders` through `apiFetch("/orders", createOrderResponseSchema, { method: "POST", body })`. The body comes from `buildOrderPayload(data, items)` and holds **no money**
- After success the form calls `saveLastOrder(result)`, empties the bag, navigates to `/order/:orderNumber` and opens `result.whatsappUrl` (only if `isWhatsappUrl`)
- The confirmation page reads `loadLastOrder()` (sessionStorage key `vss_last_order`) and compares the order number with the URL
- Forms: use `TextField`, `TextAreaField`, `SelectField` with `{...register("name")}` and `error={errors.name?.message}`
- Optional text boxes: `register("x", { setValueAs: (v) => (v === "" ? undefined : v) })` and start them as `undefined`

## How to test it
`npm run test`, then the two checklists (part 1 and part 2 task files): quantity, remove, live price and stock, validation messages, fee by state, pickup, success, stock changed, server down.

## Assumptions and known limitations
- `OrderConfirmation` is **temporary**: order number, total, the instruction and the Open WhatsApp button. FE-T7 adds the message text again, the full explanation and tracking
- There is no idempotency key. If the server saves an order but the reply is lost, a retry makes a second order (see Q22)
- There is no email field (data minimisation). Add it when confirmation emails are decided (Q4)
- The delivery time text says "days" as the zone stores it. Whether it counts from payment or dispatch is not decided (Q25)
- The last order (name, phone, address) stays in `sessionStorage` until the tab closes
- Pickup shows the business address and hours from public settings, with no pickup scheduling
- Stock is locked at the moment the order is created. Unpaid holds expire after `orderHoldHours` (mock: 24)

## Related tasks
- Previous: [FE-T5](./FE-T5-product-page.md)
- Next: [FE-T7](./FE-T7-order-page-and-tracking.md)