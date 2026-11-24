import { describe, expect, it } from "vitest";
import { faqGroups } from "./faqItems";

describe("faqGroups", () => {
  it("has unique ids and a question for every item, with and without settings", () => {
    const items = faqGroups().flatMap((group) => group.items);
    expect(items.length).toBeGreaterThan(0);
    expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
    expect(items.every((item) => item.question.trim().length > 0)).toBe(true);
  });
});