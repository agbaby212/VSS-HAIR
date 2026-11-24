# FE-T9: Booking wizard

Purpose: at `/book` a customer chooses a service or package, a place (salon or home), a date and time, fills in their details, and sends the booking to the owner on WhatsApp. No payment happens on the site.

## What was built

Part 1
- `client/src/lib/lagosDate.ts` (+ test): Lagos "today", add days, date range check
- `client/src/lib/format.ts`: `formatTime`, `formatDateLong`
- `client/src/features/booking/bookingDraft.ts` (+ test): wizard state, reducer, `isStepComplete`, `findBookable`, `initialDraft`, `slotParams`
- `client/src/features/booking/StepService.tsx`, `StepLocation.tsx`, `StepSlot.tsx`, `BookingWizard.tsx`
- `client/src/components/ui/RadioCard.tsx`, `client/src/components/booking/WizardSteps.tsx`, `BookingSummary.tsx`
- `client/src/pages/Book.tsx`, route `/book`

Part 2
- `client/src/features/booking/bookingPayload.ts` (+ test): `buildBookingPayload`, `validateBookingDetails`, `fieldForPath`, `DetailsForm`
- `client/src/features/booking/bookingErrors.ts` (+ test): `describeBookingFailure`
- `client/src/features/booking/inspirationFile.ts` (+ test), `useInspiration.ts`, `useBookingForm.ts`, `StepDetails.tsx`
- `client/src/components/booking/InspirationUpload.tsx`
- `client/src/features/booking/queries.ts`: `useSlots`, `useCreateBooking`, `useUploadInspiration`
- `client/src/pages/BookingConfirmation.tsx` (temporary, replaced in FE-T10), route `/book/confirmed/:ref`

## How other parts use it

- Links into the wizard: `/book?service=<id>` or `/book?package=<id>` start at step 2.
- `useCreateBooking().mutateAsync(payload)` returns `{ booking, whatsappUrl }`. `payload` is the cleaned `createBookingSchema` output.
- FE-T10 receives `{ whatsappUrl, manageToken }` in router state at `/book/confirmed/:ref`, and must handle a refresh (no state).
- BE-T5 must read the uploaded photo from the multipart field named `file` (jpg, png, webp, max 5 MB) and answer `{ data: { url } }`.

```ts
const result = validateBookingDetails(draft, item, details, inspirationUrl);
if (result.ok) await createBooking.mutateAsync(result.payload);
```

## How to test it

`cd client && npm run test`, then follow the FE-T9 checklist (part 2 file) in the browser with `VITE_USE_MOCKS="true"`.

## Assumptions and known limitations

- For a bridal booking the event date is the date picked in step 3.
- The shared schema does not require the bridal block, so the **server must reject** a bridal service or package that arrives without it (BE-T5).
- Blank state or city for a home visit is blocked on the client only. The shared schema still allows it (see the Contract Change Request).
- The deposit amount is not shown on the site. It appears in the WhatsApp message the server builds (BE-T5).
- The wizard starts again on refresh. Nothing is saved (Q37).
- At most 90 days ahead (`MAX_DAYS_AHEAD` in `StepSlot.tsx`, Q35).
- The real `SLOT_TAKEN` path (database exclusion constraint) is tested in BE-T5 and IN-T2. In FE-T9 it was tested with a temporary thrown error.

## Related tasks

- [FE-T8 Static pages](./FE-T8-static-pages.md)
- [FE-T10 Booking confirmation and manage page](./FE-T10-booking-confirmation.md)
- [BE-T5 Bookings](./BE-T5-bookings.md)