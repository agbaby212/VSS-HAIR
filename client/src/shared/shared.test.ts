import { describe, expect, it } from "vitest";
import { checkoutSchema, phoneSchema, trackOrderSchema } from "./index";

const variantId = "11111111-1111-4111-8111-111111111111";

describe("phoneSchema", () => {
  it.each(["08012345678", "+2348012345678", "2348012345678", "0801 234 5678"])(
    "turns %s into 2348012345678",
    (input) => {
      expect(phoneSchema.parse(input)).toBe("2348012345678");
    },
  );

  it.each(["12345", "0601234567", "abc", ""])("rejects %s", (input) => {
    expect(phoneSchema.safeParse(input).success).toBe(false);
  });
});

describe("checkoutSchema", () => {
  const base = { customerName: "Ada Obi", phone: "08012345678", items: [{ variantId, qty: 1 }] };

  it("accepts pickup without an address", () => {
    expect(checkoutSchema.safeParse({ ...base, fulfilment: "pickup" }).success).toBe(true);
  });

  it("rejects delivery without an address", () => {
    const result = checkoutSchema.safeParse({ ...base, fulfilment: "delivery" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty bag", () => {
    expect(checkoutSchema.safeParse({ ...base, fulfilment: "pickup", items: [] }).success).toBe(false);
  });
});

describe("trackOrderSchema", () => {
  it("upper-cases the order number", () => {
    const result = trackOrderSchema.parse({ orderNumber: " vss-10482 ", phone: "08012345678" });
    expect(result.orderNumber).toBe("VSS-10482");
  });
});