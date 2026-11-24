import { describe, expect, it } from "vitest";
import type { ServicesResponse } from "../../shared";
import {
  canChange, describeBooking, draftFromBooking, messageFromWhatsappUrl, statusInfo, type BookingFacts,
} from "./bookingView";

const serviceId = "00000004-0000-4000-8000-000000000001";
const packageId = "00000005-0000-4000-8000-000000000001";
const zoneId = "00000006-0000-4000-8000-000000000001";

const services: ServicesResponse = {
  services: [{ id: serviceId, name: "Braids", category: "hair", description: null, durationMin: 240, priceKobo: 4500000, homeEligible: true, isBridal: false }],
  packages: [{ id: packageId, name: "Bridal glam", description: null, includes: [], durationMin: 240, priceKobo: 18000000, homeEligible: true, isBridal: true }],
};
const zones = [{ id: zoneId, name: "Lekki and Ajah" }];

const salon: BookingFacts = {
  status: "confirmed", startAt: "2026-12-02T10:00:00+01:00", locationType: "salon", serviceId, packageId: null,
  travelFeeKobo: 0, isBridal: false, depositRequiredKobo: 0, depositPaid: false,
};
const home: BookingFacts = {
  ...salon, status: "pending", locationType: "home", travelZoneId: zoneId, address: "12 Palm Road", city: "Lekki",
  travelFeeKobo: 1000000, holdExpiresAt: "2026-12-01T10:00:00+01:00",
};
const now = Date.parse("2026-11-30T10:00:00+01:00");

describe("statusInfo and canChange", () => {
  it("gives plain words for every status", () => {
    expect(statusInfo("pending").label).toBe("Waiting for confirmation");
    expect(statusInfo("confirmed").label).toBe("Confirmed");
    expect(statusInfo("cancelled").label).toBe("Cancelled");
    expect(statusInfo("completed").label).toBe("Done");
    expect(statusInfo("no_show").label).toBe("Missed");
    expect(statusInfo("something_new").label).toBe("something_new"); // never crashes on a new status
  });

  it("lets only waiting and confirmed bookings be changed", () => {
    expect(canChange("pending")).toBe(true);
    expect(canChange("confirmed")).toBe(true);
    for (const status of ["cancelled", "completed", "no_show"]) expect(canChange(status)).toBe(false);
  });
});

describe("describeBooking", () => {
  it("shows the service, the date in words and the salon", () => {
    const view = describeBooking(salon, services, zones, now);
    expect(view.name).toBe("Braids");
    expect(view.durationMin).toBe(240);
    expect(view.when).toContain("December");
    expect(view.when).toContain("2026");
    expect(view.when).toContain("10:00");
    expect(view.where).toBe("At the salon");
    expect(view.totalKobo).toBe(4500000);
  });

  it("adds the travel fee and the address for a home visit", () => {
    const view = describeBooking(home, services, zones, now);
    expect(view.where).toBe("At your place (Lekki and Ajah): 12 Palm Road, Lekki");
    expect(view.totalKobo).toBe(5500000);
  });

  it("shows the hold only while a waiting booking is still held", () => {
    expect(describeBooking(home, services, zones, now).holdText).toContain("held for you until");
    expect(describeBooking(home, services, zones, Date.parse("2026-12-01T12:00:00+01:00")).holdText).toBeNull(); // hold is over
    expect(describeBooking({ ...home, status: "confirmed" }, services, zones, now).holdText).toBeNull();
  });

  it("shows a deposit only for bridal bookings that need one", () => {
    expect(describeBooking(salon, services, zones, now).deposit).toBeNull();
    const bridal: BookingFacts = { ...salon, serviceId: null, packageId, isBridal: true, depositRequiredKobo: 5000000, depositPaid: false };
    expect(describeBooking(bridal, services, zones, now).deposit).toEqual({ amountKobo: 5000000, received: false });
  });

  it("does not crash when the service is no longer in the list", () => {
    const view = describeBooking({ ...salon, serviceId: "00000009-0000-4000-8000-000000000009" }, services, zones, now);
    expect(view.name).toBeNull();
    expect(view.totalKobo).toBeNull();
  });
});

describe("draftFromBooking", () => {
  it("keeps the service, place and area, and leaves the date and time empty", () => {
    expect(draftFromBooking(home)).toEqual({
      kind: "service", itemId: serviceId, locationType: "home", travelZoneId: zoneId, date: null, slotStart: null,
    });
  });

  it("uses the package for a package booking and forgets the area for the salon", () => {
    expect(draftFromBooking({ ...salon, serviceId: null, packageId, travelZoneId: zoneId })).toMatchObject({
      kind: "package", itemId: packageId, locationType: "salon", travelZoneId: null,
    });
  });

  it("returns null when it cannot build a draft", () => {
    expect(draftFromBooking({ ...salon, serviceId: null, packageId: null })).toBeNull();
    expect(draftFromBooking({ ...salon, locationType: "moon" })).toBeNull();
  });
});

describe("messageFromWhatsappUrl", () => {
  it("reads the message out of the link", () => {
    expect(messageFromWhatsappUrl("https://wa.me/2348000000000?text=Hello%20there%0ABK-1")).toBe("Hello there\nBK-1");
  });

  it("returns null for a bad link or a link without text", () => {
    expect(messageFromWhatsappUrl("not a url")).toBeNull();
    expect(messageFromWhatsappUrl("https://wa.me/2348000000000")).toBeNull();
  });
});