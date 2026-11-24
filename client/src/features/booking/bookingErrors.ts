import { fieldForPath, type DetailsField } from "./bookingPayload";

export type BookingFailure =
  | { kind: "slot_taken"; message: string } // go back to step 3
  | { kind: "area"; message: string } // go back to step 2
  | { kind: "fields"; message: string; fields: Partial<Record<DetailsField, string>> } // show under the fields
  | { kind: "other"; message: string }; // show above the Send button

// We look at the shape of the error instead of using instanceof, so this file needs nothing from api.ts
type ErrorLike = { code?: unknown; message?: unknown; details?: unknown };

const FALLBACK = "We could not send your booking. Check your internet connection and try again.";

export function describeBookingFailure(error: unknown): BookingFailure {
  const e: ErrorLike = typeof error === "object" && error !== null ? (error as ErrorLike) : {};
  const message = typeof e.message === "string" && e.message.trim() !== "" ? e.message : FALLBACK;

  if (e.code === "SLOT_TAKEN") {
    return { kind: "slot_taken", message: "Someone just took that time. Please choose another time." };
  }

  if (e.code === "AREA_NOT_COVERED") {
    return {
      kind: "area",
      message: typeof e.message === "string" && e.message.trim() !== "" ? e.message : "We do not travel to that area yet. Choose the salon, or ask us on WhatsApp.",
    };
  }

  if (e.code === "VALIDATION_ERROR" && Array.isArray(e.details)) {
    const fields: Partial<Record<DetailsField, string>> = {};
    for (const item of e.details as unknown[]) {
      if (typeof item !== "object" || item === null) continue;
      const { path, message: text } = item as { path?: unknown; message?: unknown };
      if (typeof path !== "string" || typeof text !== "string") continue;
      const field = fieldForPath(path.split(".")); // the server writes "home.address"
      if (field && !fields[field]) fields[field] = text;
    }
    if (Object.keys(fields).length > 0) return { kind: "fields", message: "Please check the marked fields.", fields };
  }

  return { kind: "other", message };
}