import { describe, expect, it } from "vitest";
import { ORDER_STATUSES } from "../../shared";
import { STATUS_LABELS, TIMELINE, statusMessage, stepState } from "./orderStatus";

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
  it("has a label and a message for every status", () => {
    for (const status of ORDER_STATUSES) {
      expect(STATUS_LABELS[status].length).toBeGreaterThan(0);
      expect(statusMessage({ status, courierTracking: null }).length).toBeGreaterThan(0);
    }
  });

  it("shows pending as Awaiting payment", () => {
    expect(STATUS_LABELS.pending).toBe("Awaiting payment");
  });

  it("mentions the courier number is coming when shipped without one", () => {
    expect(statusMessage({ status: "shipped", courierTracking: null })).toMatch(/will show here/);
    expect(statusMessage({ status: "shipped", courierTracking: "DHL-1" })).not.toMatch(/will show here/);
  });
});