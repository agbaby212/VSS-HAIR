# FE-T7: Order page and tracking

Purpose: the page shown after an order is sent, and the public order tracking page.

## What was built
- `pages/OrderConfirmation.tsx` (route `order/:orderNumber`): order number, next steps, hold time, Open WhatsApp, Copy message, the message text, items, total, address
- `pages/TrackOrder.tsx` (route `track`): order number + phone form, result, "Check another order"
- `features/tracking/`: `orderStatus.ts` (`STATUS_LABELS`, `TIMELINE`, `stepState`, `statusMessage`), `queries.ts` (`useTrackOrder`), `StatusTimeline.tsx`, `TrackedOrderView.tsx`
- `components/shop/OrderItems.tsx`, `components/ui/CopyButton.tsx`
- `lib/format.ts` `formatDateTime`, `lib/whatsapp.ts` `messageFromWhatsappUrl`

## How other parts use it
- Customer status text everywhere: `STATUS_LABELS[status]` (pending is "Awaiting payment")
- Timeline for any order status: `<StatusTimeline status={order.status} />`
- Track an order: `const track = useTrackOrder(); track.mutate({ orderNumber, phone })` (phone already normalized by the schema)
- Link to tracking with the number filled in: `/track?order=VSS-10482` (never put a phone in the address)
- Copy to clipboard: `<CopyButton text="..." label="Copy" />`
- Show money lines of an order: `<OrderItems items={order.items} />`
- Read the server's message back from its link: `messageFromWhatsappUrl(whatsappUrl)`
- Format a server time in Lagos time: `formatDateTime(iso)`

## How to test it
`npm run test`, then the checklist in the task file. Use the console helper `set(status, extra)` to see every status without the admin.

## Assumptions and known limitations
- The confirmation page reads only `sessionStorage` (`vss_last_order`), so another tab or a closed tab shows "We cannot show that order here" and a link to track it
- Tracked orders do not say whether the order is delivery or pickup, so a pickup order still shows "Shipped" wording (Q26)
- The timeline does not show dates for each step (the contract has only `createdAt` and `paidAt`)
- Status sentences are placeholders for the owner to approve
- The hold sentence ("After that the order is cancelled and the items go back on sale") matches the automatic hold release (Section 3)
- A wrong order number and a wrong phone return one identical `404`, and the server also rate-limits the route (BE phase)

## Related tasks
- Previous: [FE-T6](./FE-T6-cart-and-checkout.md)
- Next: [FE-T8](./FE-T8-static-pages.md)