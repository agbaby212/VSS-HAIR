import { describe, expect, it } from "vitest";
import type { Service } from "../../shared";
import { formatDuration, splitServices } from "./serviceUtils";

function service(name: string, category: Service["category"], isBridal = false): Service {
  return {
    id: "00000004-0000-4000-8000-000000000001", name, category, description: null, durationMin: 60, priceKobo: 100,
    homeEligible: false, isBridal,
  };
}

describe("formatDuration", () => {
  it("reads naturally", () => {
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(60)).toBe("1 hour");
    expect(formatDuration(90)).toBe("1 hr 30 min");
    expect(formatDuration(120)).toBe("2 hours");
    expect(formatDuration(240)).toBe("4 hours");
  });
});

describe("splitServices", () => {
  it("puts bridal services in their own list and groups the rest in a fixed order", () => {
    const { groups, bridal } = splitServices([
      service("Manicure", "nails_feet"),
      service("Braids", "hair"),
      service("Bridal makeup", "bridal", true),
      service("Glam", "makeup"),
    ]);
    expect(groups.map((group) => group.label)).toEqual(["Hair", "Makeup", "Nails and feet"]);
    expect(bridal.map((item) => item.name)).toEqual(["Bridal makeup"]);
  });

  it("leaves out empty groups", () => {
    expect(splitServices([service("Braids", "hair")]).groups).toHaveLength(1);
  });
});