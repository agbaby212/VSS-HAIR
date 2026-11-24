import { describe, expect, it } from "vitest";
import type { CheckoutInput } from "../../shared";
import { buildOrderPayload, deliveryEtaText } from "./orderPayload";

const base: CheckoutInput = {
  customerName: "Ada Obi", phone: "2348012345678", fulfilment: "delivery", state: "Lagos", city: "Ikeja",
  address: "12 Example Street", notes: "Call me", items: [],
};
const items = [{ variantId: "00000002-0000-4000-8000-000000000001", qty: 2 }];

describe("buildOrderPayload", () => {
  it("sends only variant ids and quantities for the items, never prices", () => {
    const withExtras = [{ ...items[0], unitPriceKobo: 1, productName: "x" }];
    const payload = buildOrderPayload(base, withExtras);
    expect(payload.items).toEqual(items);
    expect(JSON.stringify(payload)).not.toMatch(/price|total|fee/i);
  });

  it("keeps the address for delivery", () => {
    expect(buildOrderPayload(base, items)).toMatchObject({ state: "Lagos", city: "Ikeja", address: "12 Example Street" });
  });

  it("drops the address for pickup", () => {
    const payload = buildOrderPayload({ ...base, fulfilment: "pickup" }, items);
    expect(payload.state).toBeUndefined();
    expect(payload.city).toBeUndefined();
    expect(payload.address).toBeUndefined();
  });
});

describe("deliveryEtaText", () => {
  it("reads naturally", () => {
    expect(deliveryEtaText({ etaDaysMin: 2, etaDaysMax: 5 })).toBe("2 to 5 days");
    expect(deliveryEtaText({ etaDaysMin: 3, etaDaysMax: 3 })).toBe("3 days");
    expect(deliveryEtaText({ etaDaysMin: 1, etaDaysMax: 1 })).toBe("1 day");
  });
});