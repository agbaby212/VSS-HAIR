import { beforeEach, describe, expect, it } from "vitest";
import type { CheckoutInput, CreateBookingInput } from "../shared";
import { createBooking, createOrder, getState, releaseExpiredHolds, resetDb } from "./db";
import { MockApiError } from "./errors";
import { generateSlots, lagosMs, type SlotRules } from "./slots";

const NOW = new Date("2026-11-13T10:00:00+01:00"); // a Friday

function codeOf(run: () => unknown): string | null {
  try {
    run();
    return null;
  } catch (error) {
    return error instanceof MockApiError ? error.code : "NOT_A_MOCK_ERROR";
  }
}

beforeEach(() => {
  resetDb(NOW);
  getState().availability.dayOffs = []; // seed has a day off relative to "today", keep tests steady
});

function lastBlondeWig() {
  const product = getState().products.find((p) => p.slug === "body-wave-lace-wig")!;
  return { product, variant: product.variants.find((v) => v.color === "Honey blonde")! }; // stock is 1
}

function pickup(variantId: string, qty = 1): CheckoutInput {
  return { customerName: "Ada Obi", phone: "2348012345678", fulfilment: "pickup", items: [{ variantId, qty }] };
}

describe("orders", () => {
  it("lowers stock and never sells the last item twice", () => {
    const { variant } = lastBlondeWig();
    expect(createOrder(pickup(variant.id), NOW).status).toBe("pending");
    expect(variant.stock).toBe(0);
    expect(codeOf(() => createOrder(pickup(variant.id), NOW))).toBe("OUT_OF_STOCK");
  });

  it("leaves stock alone when one line of the order fails", () => {
    const { variant } = lastBlondeWig();
    const bundle = getState().products[0].variants[0];
    const before = bundle.stock;
    const input = { ...pickup(bundle.id), items: [{ variantId: bundle.id, qty: 1 }, { variantId: variant.id, qty: 5 }] };
    expect(codeOf(() => createOrder(input, NOW))).toBe("OUT_OF_STOCK");
    expect(bundle.stock).toBe(before);
  });

  it("frees the stock of an unpaid order once, after the hold time", () => {
    const { variant } = lastBlondeWig();
    const order = createOrder(pickup(variant.id), NOW);
    const later = new Date(NOW.getTime() + 25 * 3_600_000); // hold is 24 hours
    releaseExpiredHolds(later);
    expect(order.status).toBe("cancelled");
    expect(variant.stock).toBe(1);
    releaseExpiredHolds(later); // second run must change nothing
    expect(variant.stock).toBe(1);
  });
});

describe("slots", () => {
  const rules: SlotRules = {
    weeklyHours: [{ weekday: 3, start: "09:00", end: "18:00" }], // Wednesday
    dayOffs: [], bridalBlocks: [], slotMinutes: 30, minNoticeHoursHome: 24,
  };
  const base = { date: "2026-12-02", durationMin: 60, bufferMin: 0, isHome: false, isBridal: false, rules, busy: [], now: NOW };
  const starts = (slots: { startAt: string }[]) => slots.map((s) => s.startAt.slice(11, 16));

  it("ends the day when the appointment can still finish before closing", () => {
    const list = starts(generateSlots(base));
    expect(list[0]).toBe("09:00");
    expect(list.at(-1)).toBe("17:00"); // 17:00 + 60 minutes = 18:00. 17:30 would run late
  });

  it("returns nothing on a day off", () => {
    expect(generateSlots({ ...base, rules: { ...rules, dayOffs: ["2026-12-02"] } })).toEqual([]);
  });

  it("returns nothing for a home visit inside the notice window", () => {
    const now = new Date("2026-12-02T08:00:00+01:00"); // 24 hours of notice runs past tonight
    expect(generateSlots({ ...base, isHome: true, now })).toEqual([]);
  });

  it("keeps the travel buffer clear around an existing booking", () => {
    const busy = [{ start: lagosMs("2026-12-02", "12:00"), end: lagosMs("2026-12-02", "13:00") }];
    const list = starts(generateSlots({ ...base, bufferMin: 60, busy }));
    expect(list).toContain("10:00"); // ends 11:00, plus 60 min travel = 12:00: just fits
    expect(list).not.toContain("10:30"); // travel would run into the booking
  });
});

describe("bookings", () => {
  function salonBooking(): CreateBookingInput {
    const service = getState().services.find((s) => s.name === "Wig install and styling")!;
    return { serviceId: service.id, locationType: "salon", startAt: "2026-12-02T10:00:00+01:00", customerName: "Ada Obi", phone: "2348012345678" };
  }

  it("lets only one of two people have the same time", () => {
    expect(createBooking(salonBooking(), NOW).status).toBe("pending");
    expect(codeOf(() => createBooking(salonBooking(), NOW))).toBe("SLOT_TAKEN");
  });

  it("asks for bridal details on a bridal package and sets the deposit", () => {
    const pack = getState().packages[0];
    const input: CreateBookingInput = { ...salonBooking(), serviceId: undefined, packageId: pack.id };
    expect(codeOf(() => createBooking(input, NOW))).toBe("VALIDATION_ERROR");

    const bridal = { eventDate: "2027-02-20", venue: "Lagos", callTime: "06:00", partySize: 4, trialSession: true };
    const booking = createBooking({ ...input, bridal }, NOW);
    expect(booking.depositRequiredKobo).toBe(pack.priceKobo / 2); // 50% sample deposit
    expect(booking.depositPaid).toBe(false);
  });
});