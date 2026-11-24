import type { z } from "zod";
import { createBookingSchema } from "../../shared";
import type { Bookable, BookingDraft } from "./bookingDraft";

// What the server receives, after the shared schema cleaned it (phone is now 234XXXXXXXXXX)
export type BookingInput = z.infer<typeof createBookingSchema>;

// Everything the customer types on step 4. A text box always gives text, even for numbers
export type DetailsForm = {
  customerName: string;
  phone: string;
  notes: string;
  state: string; // home visit only
  city: string; // home visit only
  address: string; // home visit only
  landmark: string; // home visit only
  venue: string; // bridal only
  callTime: string; // bridal only, "06:30"
  partySize: string; // bridal only, turned into a number below
  trialSession: boolean; // bridal only
};

export type DetailsField = keyof DetailsForm;

export const DETAILS_FIELDS: readonly DetailsField[] = [
  "customerName", "phone", "notes", "state", "city", "address", "landmark", "venue", "callTime", "partySize", "trialSession",
];

export const emptyDetails: DetailsForm = {
  customerName: "", phone: "", notes: "", state: "", city: "", address: "", landmark: "",
  venue: "", callTime: "", partySize: "", trialSession: false,
};

// "form" = a problem that belongs to no single field
export type DetailsErrors = Partial<Record<DetailsField | "form", string>>;

function blankToUndefined(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

// Turns the wizard choices and the form into the body for POST /bookings.
// It returns a plain object on purpose: it may still be wrong, and the shared schema is what judges it
export function buildBookingPayload(
  draft: BookingDraft,
  item: Bookable | null,
  details: DetailsForm,
  inspirationUrl: string | null,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    ...(draft.kind === "service" ? { serviceId: draft.itemId } : { packageId: draft.itemId }),
    locationType: draft.locationType,
    startAt: draft.slotStart,
    customerName: details.customerName.trim(),
    phone: details.phone,
    notes: blankToUndefined(details.notes),
    inspirationUrl: inspirationUrl ?? undefined,
  };

  // Only a home visit has an address block
  if (draft.locationType === "home") {
    payload.home = {
      travelZoneId: draft.travelZoneId,
      state: details.state.trim(),
      city: details.city.trim(),
      address: details.address.trim(),
      landmark: blankToUndefined(details.landmark),
    };
  }

  // Only a bridal service or package has the bridal block. The event date is the date picked in step 3
  if (item?.isBridal) {
    payload.bridal = {
      eventDate: draft.date,
      venue: details.venue.trim(),
      callTime: details.callTime,
      partySize: details.partySize.trim() === "" ? undefined : Number(details.partySize),
      trialSession: details.trialSession,
    };
  }

  return payload;
}

// Which form field does a Zod path belong to? ["home", "address"] -> "address". null = no single field.
// Also used for the server's error details, which use the same paths joined with dots
export function fieldForPath(path: ReadonlyArray<PropertyKey>): DetailsField | null {
  const [first, second] = path;
  switch (first) {
    case "customerName":
    case "phone":
    case "notes":
      return first;
    case "home":
      return second === "state" || second === "city" || second === "address" || second === "landmark" ? second : "address";
    case "bridal":
      return second === "venue" || second === "callTime" || second === "partySize" || second === "trialSession" ? second : null;
    default:
      return null;
  }
}

// The schema's own messages are short and technical ("String must contain at least 5 character(s)").
// These say what went wrong and how to fix it. The phone message is already good, so it is kept
const FRIENDLY: Partial<Record<DetailsField, string>> = {
  customerName: "Enter your name, at least 2 letters.",
  notes: "Keep your note under 500 characters.",
  address: "Enter the full address, at least 5 characters.",
  landmark: "Keep the landmark under 120 characters.",
  venue: "Enter the venue name, at least 2 characters.",
  callTime: "Choose the call time, like 06:30.",
  partySize: "Enter how many people are in your bridal party, from 1 to 30.",
};

export type ValidationResult = { ok: true; payload: BookingInput } | { ok: false; errors: DetailsErrors };

export function validateBookingDetails(
  draft: BookingDraft,
  item: Bookable | null,
  details: DetailsForm,
  inspirationUrl: string | null,
): ValidationResult {
  const errors: DetailsErrors = {};
  const result = createBookingSchema.safeParse(buildBookingPayload(draft, item, details, inspirationUrl));

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = fieldForPath(issue.path) ?? "form";
      if (errors[field]) continue; // one message per field is enough
      errors[field] = field === "form" || field === "phone" ? issue.message : (FRIENDLY[field] ?? issue.message);
    }
  }

  // The shared schema accepts a blank state or city for a home visit. The checkout form does not,
  // so we add the rule here instead of editing the contract (see the Contract Change Request)
  if (draft.locationType === "home") {
    if (details.state.trim().length < 2 && !errors.state) errors.state = "Enter your state.";
    if (details.city.trim().length < 2 && !errors.city) errors.city = "Enter your city or town.";
  }

  if (result.success && Object.keys(errors).length === 0) return { ok: true, payload: result.data };
  return { ok: false, errors };
}