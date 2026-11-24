import { describe, expect, it } from "vitest";
import { GALLERY_ITEMS, filterGallery, parseGalleryCategory } from "./gallery";

describe("parseGalleryCategory", () => {
  it("accepts our four categories", () => {
    expect(parseGalleryCategory("bridal")).toBe("bridal");
    expect(parseGalleryCategory("before_after")).toBe("before_after");
  });

  it("ignores anything else", () => {
    expect(parseGalleryCategory("nope")).toBeUndefined();
    expect(parseGalleryCategory(null)).toBeUndefined();
    expect(parseGalleryCategory("")).toBeUndefined();
  });
});

describe("filterGallery", () => {
  it("shows everything with no category", () => {
    expect(filterGallery(GALLERY_ITEMS, undefined)).toHaveLength(GALLERY_ITEMS.length);
  });

  it("shows only the chosen category", () => {
    const braids = filterGallery(GALLERY_ITEMS, "braids");
    expect(braids.length).toBeGreaterThan(0);
    expect(braids.every((item) => item.category === "braids")).toBe(true);
  });
});

describe("the list itself", () => {
  it("has unique ids", () => {
    const ids = GALLERY_ITEMS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every before and after look a before photo, and no other look one", () => {
    for (const item of GALLERY_ITEMS) {
      expect(item.before !== undefined).toBe(item.category === "before_after");
    }
  });
});