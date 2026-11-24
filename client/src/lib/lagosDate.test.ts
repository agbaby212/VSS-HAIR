import { describe, expect, it } from "vitest";
import { addDaysToDate, isDateInRange, lagosDateString } from "./lagosDate";

describe("lagosDateString", () => {
  it("gives the Lagos date, even when UTC is still on the day before", () => {
    // 23:30 UTC on 23 November is 00:30 on 24 November in Lagos
    expect(lagosDateString(Date.parse("2026-11-23T23:30:00Z"))).toBe("2026-11-24");
    expect(lagosDateString(Date.parse("2026-11-23T12:00:00Z"))).toBe("2026-11-23");
  });
});

describe("addDaysToDate", () => {
  it("crosses month and year ends", () => {
    expect(addDaysToDate("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDaysToDate("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDaysToDate("2026-12-01", 90)).toBe("2027-03-01");
  });
});

describe("isDateInRange", () => {
  it("accepts the limits and dates between them", () => {
    expect(isDateInRange("2026-12-01", "2026-12-01", "2026-12-31")).toBe(true);
    expect(isDateInRange("2026-12-31", "2026-12-01", "2026-12-31")).toBe(true);
  });

  it("rejects dates outside, impossible dates and text that is not a date", () => {
    expect(isDateInRange("2026-11-30", "2026-12-01", "2026-12-31")).toBe(false);
    expect(isDateInRange("2027-01-01", "2026-12-01", "2026-12-31")).toBe(false);
    expect(isDateInRange("2026-02-31", "2026-01-01", "2026-12-31")).toBe(false);
    expect(isDateInRange("tomorrow", "2026-01-01", "2026-12-31")).toBe(false);
    expect(isDateInRange("", "2026-01-01", "2026-12-31")).toBe(false);
  });
});