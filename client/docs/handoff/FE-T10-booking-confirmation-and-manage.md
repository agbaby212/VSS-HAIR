# FE-T10: Booking confirmation and manage page

Purpose: after sending a booking the customer sees a confirmation page. With the secret manage link they can see the booking, change its time or cancel it, with the cancellation policy shown first.

## What was built

- `client/src/pages/BookingConfirmation.tsx` (route `/book/confirmed/:ref`, replaces the FE-T9 temporary page)
- `client/src/pages/ManageBooking.tsx` (route `/booking/manage/:token`)
- `client/src/components/booking/BookingDetails.tsx`, `PolicyBox.tsx`
- `client/src/features/booking/ReschedulePanel.tsx`, `CancelPanel.tsx`
- `client/src/features/booking/bookingView.ts` (+ test): `describeBooking`, `statusInfo`, `canChange`, `draftFromBooking`, `messageFromWhatsappUrl`
- `client/src/features/booking/cancellationPolicy.ts` (+ test): `readPolicy`
- `client/src/features/booking/queries.ts`: `useManagedBooking`, `useUpdateBooking`, type `ManageBody`
- `client/src/lib/confirmationStore.ts` (+ test), `client/src/lib/useNoIndex.ts`

## How other parts use it

- The wizard navigates to `/book/confirmed/<bookingRef>` with router state `{ whatsappUrl, manageToken }`.
- Anything that has a booking's token can link to `/booking/manage/<token>`.
- `useNoIndex()` can be used by any page whose address holds a secret.

```ts
const booking = useManagedBooking(token);                 // GET /bookings/manage/:token
const update = useUpdateBooking(token);
await update.mutateAsync({ action: "cancel" });           // PATCH
await update.mutateAsync({ action: "reschedule", startAt }); // PATCH
```

## How to test it

`cd client && npm run test`, then follow the FE-T10 checklist in the browser with `VITE_USE_MOCKS="true"`.

## Assumptions and known limitations

- PATCH body is `{ action: "cancel" }` or `{ action: "reschedule", startAt }` (CCR-2). BE-T5 must accept exactly this and answer the updated booking.
- GET and PATCH on `/bookings/manage/:token` return the booking with the Section 5 columns in camelCase, including `holdExpiresAt`, `depositRequiredKobo` and `depositPaid`. They do not need the service name.
- The server decides what the cancellation policy allows and answers with a clear message when it refuses. The client shows that message.
- Bridal bookings cannot be rescheduled on the site. The owner moves them (Q42).
- The manage token travels in the address. The pages use `noindex` and `no-referrer`, and the server must never log it (BE-T5, BE-T13).
- The confirmation page keeps the token in `sessionStorage` for this tab only. A new tab has no manage link.
- The policy text comes from the public setting `cancellationPolicy`, as plain text or `{ text }`.

## Related tasks

- [FE-T9 Booking wizard](./FE-T9-booking-wizard.md)
- [FE-T14 Admin availability, fees, settings, reviews](./FE-T14-admin-availability-settings.md)
- [BE-T5 Bookings](./BE-T5-bookings.md)