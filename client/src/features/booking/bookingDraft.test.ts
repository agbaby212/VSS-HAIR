import { describe, expect, it } from "vitest";
import type { ServicesResponse } from "../../shared";
import {
  bookingReducer, emptyDraft, findBookable, initialDraft, isStepComplete, slotParams, type BookingDraft,
} from "./bookingDraft";

const serviceId = "00000004-0000-4000-8000-000000000001";
const packageId = "00000005-0000-4000-8000-000000000001";
const data: ServicesResponse = {
  services: [{ id: serviceId, name: "Braids", category: "hair", description: null, durationMin: 240, priceKobo: 4500000, homeEligible: true, isBridal: false }],
  packages: [{ id: packageId, name: "Bridal glam", description: null, includes: [], durationMin: 240, priceKobo: 18000000, homeEligible: true, isBridal: true }],
};

const full: BookingDraft = {
  ...emptyDraft,
  kind: "service", itemId: serviceId, locationType: "home", travelZoneId: "zone", date: "2026-12-02", slotStart: "2026-12-02T10:00:00+01:00",
};

describe("bookingReducer", () => {
  it("clears the chosen time when the date changes", () => {
    const next = bookingReducer(full, { type: "chooseDate", date: "2026-12-03" });
    expect(next.date).toBe("2026-12-03");
    expect(next.slotStart).toBeNull();
    expect(next.slotUnavailable).toBe(false);
  });

  it("clears an unavailable time and shows the availability notice", () => {
    const next = bookingReducer(full, { type: "slotUnavailable" });
    expect(next.slotStart).toBeNull();
    expect(next.slotUnavailable).toBe(true);
    expect(bookingReducer(next, { type: "chooseSlot", slotStart: "2026-12-02T11:00:00+01:00" }).slotUnavailable).toBe(false);
  });

  it("clears the time when the area or the place changes", () => {
    expect(bookingReducer(full, { type: "chooseZone", travelZoneId: "other" }).slotStart).toBeNull();
    expect(bookingReducer(full, { type: "chooseLocation", locationType: "salon" }).slotStart).toBeNull();
  });

  it("forgets the area when the customer switches to the salon", () => {
    expect(bookingReducer(full, { type: "chooseLocation", locationType: "salon" }).travelZoneId).toBeNull();
  });

  it("drops 'home' when a salon-only service is chosen", () => {
    const next = bookingReducer(full, { type: "chooseItem", kind: "service", id: "salon-only", homeEligible: false });
    expect(next).toMatchObject({ itemId: "salon-only", locationType: null, travelZoneId: null, slotStart: null });
  });

  it("keeps 'home' when the new service allows it, but still clears the time", () => {
    const next = bookingReducer(full, { type: "chooseItem", kind: "package", id: packageId, homeEligible: true });
    expect(next.locationType).toBe("home");
    expect(next.slotStart).toBeNull();
  });

  it("stores a chosen time without touching anything else", () => {
    const next = bookingReducer({ ...full, slotStart: null }, { type: "chooseSlot", slotStart: "2026-12-02T11:00:00+01:00" });
    expect(next).toEqual({ ...full, slotStart: "2026-12-02T11:00:00+01:00" });
  });
});

describe("isStepComplete", () => {
  it("needs a service for step 1", () => {
    expect(isStepComplete(1, emptyDraft)).toBe(false);
    expect(isStepComplete(1, { ...emptyDraft, kind: "service", itemId: serviceId })).toBe(true);
  });

  it("needs an area for a home visit but not for the salon (step 2)", () => {
    expect(isStepComplete(2, { ...emptyDraft, locationType: "salon" })).toBe(true);
    expect(isStepComplete(2, { ...emptyDraft, locationType: "home" })).toBe(false);
    expect(isStepComplete(2, { ...emptyDraft, locationType: "home", travelZoneId: "zone" })).toBe(true);
    expect(isStepComplete(2, emptyDraft)).toBe(false);
  });

  it("needs a date and a time for step 3", () => {
    expect(isStepComplete(3, { ...full, slotStart: null })).toBe(false);
    expect(isStepComplete(3, full)).toBe(true);
  });
});

describe("findBookable and initialDraft", () => {
  it("finds a service or a package", () => {
    expect(findBookable(data, "service", serviceId)?.name).toBe("Braids");
    expect(findBookable(data, "package", packageId)?.isBridal).toBe(true);
    expect(findBookable(data, "service", packageId)).toBeNull();
  });

  it("starts from a valid link and ignores a wrong one", () => {
    expect(initialDraft(data, serviceId, null)).toMatchObject({ kind: "service", itemId: serviceId });
    expect(initialDraft(data, null, packageId)).toMatchObject({ kind: "package", itemId: packageId });
    expect(initialDraft(data, "nope", null)).toEqual(emptyDraft);
    expect(initialDraft(data, null, null)).toEqual(emptyDraft);
  });
});

describe("slotParams", () => {
  it("is null until enough is chosen", () => {
    expect(slotParams(emptyDraft)).toBeNull();
    expect(slotParams({ ...full, travelZoneId: null })).toBeNull(); // a home visit needs an area
    expect(slotParams({ ...full, date: null })).toBeNull();
  });

  it("asks for a service or a package, never both, and only sends the area for a home visit", () => {
    expect(slotParams(full)).toEqual({ serviceId: serviceId, date: "2026-12-02", locationType: "home", travelZoneId: "zone" });
    expect(slotParams({ ...full, kind: "package", itemId: packageId, locationType: "salon", travelZoneId: null })).toEqual({
      packageId, date: "2026-12-02", locationType: "salon",
    });
  });
});