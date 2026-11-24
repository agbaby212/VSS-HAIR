import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import type { Bookable, BookingDraft } from "./bookingDraft";
import { DETAILS_FIELDS, emptyDetails, validateBookingDetails, type DetailsForm } from "./bookingPayload";

export function useBookingForm(draft: BookingDraft, item: Bookable | null, inspirationUrl: string | null) {
  const resolver: Resolver<DetailsForm> = (values) => {
    const result = validateBookingDetails(draft, item, values, inspirationUrl);
    if (result.ok) return { values, errors: {} };

    const errors: FieldErrors<DetailsForm> = {};
    for (const field of DETAILS_FIELDS) {
      const message = result.errors[field];
      if (message) errors[field] = { type: "validate", message };
    }
    // A problem that belongs to no field. Shown above the Send button
    if (result.errors.form) {
      errors.root = { type: "validate", message: result.errors.form } as NonNullable<FieldErrors<DetailsForm>["root"]>;
    }
    return { values: {}, errors };
  };

  return useForm<DetailsForm>({ resolver, defaultValues: emptyDetails });
}