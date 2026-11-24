import { describe, expect, it } from "vitest";
import { ORDER_STATUSES } from "../../shared";
import { TIMELINE, statusLabel, statusMessage, stepState } from "./orderStatus";

describe("stepState", () => {
  it("marks earlier steps done, the current one current, later ones upcoming", () => {
    expect(TIMELINE.map((step) => stepState("processing", step))).toEqual(["done", "done", "current", "upcoming", "upcoming"]);
    expect(TIMELINE.map((step) => stepState("pending", step))).toEqual(["current", "upcoming", "upcoming", "upcoming", "upcoming"]);
  });

  it("marks every step done once delivered", () => {
    expect(TIMELINE.map((step) => stepState("delivered", step))).toEqual(["done", "done", "done", "done", "done"]);
  });

  it("shows no progress for a cancelled order", () => {
    expect(TIMELINE.map((step) => stepState("cancelled", step))).toEqual(["upcoming", "upcoming", "upcoming", "upcoming", "upcoming"]);
  });
});

describe("labels and messages", () => {
  it("has a label and a message for every status, for delivery and pickup", () => {
    for (const status of ORDER_STATUSES) {
      for (const fulfilment of ["delivery", "pickup"] as const) {
        expect(statusLabel(status, fulfilment).length).toBeGreaterThan(0);
        expect(statusMessage({ status, courierTracking: null, fulfilment }).length).toBeGreaterThan(0);
      }
    }
  });

  it("shows pending as Awaiting payment", () => {
    expect(statusLabel("pending")).toBe("Awaiting payment");
  });

  it("uses pickup words only for pickup orders", () => {
    expect(statusLabel("shipped", "delivery")).toBe("Shipped");
    expect(statusLabel("shipped", "pickup")).toBe("Ready for pickup");
    expect(statusLabel("delivered", "pickup")).toBe("Collected");
    expect(statusLabel("paid", "pickup")).toBe("Paid");
  });

  it("mentions the courier number is coming when a delivery is shipped without one", () => {
    expect(statusMessage({ status: "shipped", courierTracking: null, fulfilment: "delivery" })).toMatch(/will show here/);
    expect(statusMessage({ status: "shipped", courierTracking: "DHL-1", fulfilment: "delivery" })).not.toMatch(/will show here/);
    expect(statusMessage({ status: "shipped", courierTracking: null, fulfilment: "pickup" })).not.toMatch(/courier/);
  });
});