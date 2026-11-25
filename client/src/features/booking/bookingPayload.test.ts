import { describe, expect, it } from "vitest";
import { emptyDraft, type Bookable, type BookingDraft } from "./bookingDraft";
import {
  buildBookingPayload, emptyDetails, fieldForPath, validateBookingDetails, type DetailsForm,
} from "./bookingPayload";

const serviceId = "00000004-0000-4000-8000-000000000001";
const packageId = "00000005-0000-4000-8000-000000000001";
const zoneId = "00000006-0000-4000-8000-000000000001";

const salonDraft: BookingDraft = {
  ...emptyDraft,
  kind: "service", itemId: serviceId, locationType: "salon", travelZoneId: null,
  date: "2026-12-02", slotStart: "2026-12-02T10:00:00+01:00",
};
const homeDraft: BookingDraft = { ...salonDraft, locationType: "home", travelZoneId: zoneId };
const bridalDraft: BookingDraft = { ...salonDraft, kind: "package", itemId: packageId };

const service: Bookable = {
  kind: "service", id: serviceId, name: "Braids", description: null, durationMin: 240,
  priceKobo: 4500000, homeEligible: true, isBridal: false,
};
const bridalPackage: Bookable = { ...service, kind: "package", id: packageId, name: "Bridal glam", isBridal: true };

const details: DetailsForm = { ...emptyDetails, customerName: "Ada Obi", phone: "08012345678" };
const homeDetails: DetailsForm = { ...details, state: "Lagos", city: "Lekki", address: "12 Palm Road" };
const bridalDetails: DetailsForm = { ...details, venue: "Eko Hotel", callTime: "06:30", partySize: "5", trialSession: true };

describe("buildBookingPayload", () => {
  it("builds a salon booking with no home or bridal block, and leaves blanks out", () => {
    const payload = buildBookingPayload(salonDraft, service, { ...details, notes: "   " }, null);
    expect(payload).toEqual({
      serviceId, locationType: "salon", startAt: "2026-12-02T10:00:00+01:00", customerName: "Ada Obi", phone: "08012345678",
    });
    expect(payload).not.toHaveProperty("home");
    expect(payload).not.toHaveProperty("bridal");
  });

  it("sends packageId for a package and the photo url when there is one", () => {
    const payload = buildBookingPayload(bridalDraft, service, details, "https://img.example/x.jpg");
    expect(payload).toMatchObject({ packageId, inspirationUrl: "https://img.example/x.jpg" });
    expect(payload).not.toHaveProperty("serviceId");
  });

  it("adds the home block for a home visit", () => {
    const payload = buildBookingPayload(homeDraft, service, { ...homeDetails, landmark: " " }, null);
    expect(payload.home).toEqual({ travelZoneId: zoneId, state: "Lagos", city: "Lekki", address: "12 Palm Road" });
  });

  it("adds the bridal block, using the date picked in step 3 as the event date, and a number for the party size", () => {
    const payload = buildBookingPayload(bridalDraft, bridalPackage, bridalDetails, null);
    expect(payload.bridal).toEqual({ eventDate: "2026-12-02", venue: "Eko Hotel", callTime: "06:30", partySize: 5, trialSession: true });
  });
});

describe("validateBookingDetails", () => {
  it("accepts a good salon booking and cleans the phone number", () => {
    const result = validateBookingDetails(salonDraft, service, details, null);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.payload.phone).toBe("2348012345678");
  });

  it("accepts phone numbers typed with +234", () => {
    const result = validateBookingDetails(salonDraft, service, { ...details, phone: "+2348012345678" }, null);
    expect(result.ok).toBe(true);
  });

  it("gives a clear message for each wrong field", () => {
    const result = validateBookingDetails(
      homeDraft, service, { ...homeDetails, customerName: "A", phone: "123", address: "12", state: "", city: "" }, null,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.customerName).toBe("Enter your name, at least 2 letters.");
      expect(result.errors.phone).toContain("Nigerian phone number");
      expect(result.errors.address).toContain("full address");
      expect(result.errors.state).toBe("Enter your state.");
      expect(result.errors.city).toBe("Enter your city or town.");
    }
  });

  it("rejects a note that is too long", () => {
    const result = validateBookingDetails(salonDraft, service, { ...details, notes: "x".repeat(501) }, null);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.notes).toBe("Keep your note under 500 characters.");
  });

  it("needs the bridal fields for a bridal booking", () => {
    const result = validateBookingDetails(bridalDraft, bridalPackage, details, null);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.venue).toBeDefined();
      expect(result.errors.callTime).toBeDefined();
      expect(result.errors.partySize).toBeDefined();
    }
  });

  it("accepts a complete bridal booking", () => {
    const result = validateBookingDetails(bridalDraft, bridalPackage, bridalDetails, null);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.payload.bridal).toMatchObject({ partySize: 5, trialSession: true });
  });
});

describe("fieldForPath", () => {
  it("maps schema paths to form fields", () => {
    expect(fieldForPath(["customerName"])).toBe("customerName");
    expect(fieldForPath(["home", "address"])).toBe("address");
    expect(fieldForPath(["home"])).toBe("address");
    expect(fieldForPath(["bridal", "callTime"])).toBe("callTime");
  });

  it("returns null when no single field owns the problem", () => {
    expect(fieldForPath([])).toBeNull();
    expect(fieldForPath(["startAt"])).toBeNull();
    expect(fieldForPath(["bridal", "eventDate"])).toBeNull();
  });
});