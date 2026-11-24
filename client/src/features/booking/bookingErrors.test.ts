import { describe, expect, it } from "vitest";
import { describeBookingFailure } from "./bookingErrors";

describe("describeBookingFailure", () => {
  it("sends a taken time back to step 3 with a clear message", () => {
    expect(describeBookingFailure({ code: "SLOT_TAKEN", message: "Conflict" })).toEqual({
      kind: "slot_taken",
      message: "Someone just took that time. Please choose another time.",
    });
  });

  it("sends an uncovered area back to step 2 and keeps the server's message", () => {
    expect(describeBookingFailure({ code: "AREA_NOT_COVERED", message: "We do not travel to Ikorodu." })).toEqual({
      kind: "area",
      message: "We do not travel to Ikorodu.",
    });
  });

  it("places server field errors under the right fields", () => {
    const failure = describeBookingFailure({
      code: "VALIDATION_ERROR",
      message: "Invalid request body",
      details: [{ path: "home.address", message: "Too short" }, { path: "phone", message: "Enter a Nigerian phone number" }],
    });
    expect(failure.kind).toBe("fields");
    if (failure.kind === "fields") expect(failure.fields).toEqual({ address: "Too short", phone: "Enter a Nigerian phone number" });
  });

  it("falls back to a general message when no field can be matched", () => {
    const failure = describeBookingFailure({ code: "VALIDATION_ERROR", message: "Invalid request body", details: [{ path: "startAt", message: "Bad" }] });
    expect(failure).toEqual({ kind: "other", message: "Invalid request body" });
  });

  it("uses a helpful message when the network fails or the error is unknown", () => {
    expect(describeBookingFailure(new Error("")).kind).toBe("other");
    expect(describeBookingFailure(undefined)).toEqual({
      kind: "other",
      message: "We could not send your booking. Check your internet connection and try again.",
    });
  });
});