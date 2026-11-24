import { describe, expect, it } from "vitest";
import { MAX_INSPIRATION_BYTES, validateInspirationFile } from "./inspirationFile";

describe("validateInspirationFile", () => {
  it("accepts jpg, png and webp up to 5 MB", () => {
    expect(validateInspirationFile({ type: "image/jpeg", size: 1000 })).toBeNull();
    expect(validateInspirationFile({ type: "image/png", size: 1000 })).toBeNull();
    expect(validateInspirationFile({ type: "image/webp", size: MAX_INSPIRATION_BYTES })).toBeNull();
  });

  it("rejects other types", () => {
    expect(validateInspirationFile({ type: "application/pdf", size: 1000 })).toBe("Choose a JPG, PNG or WebP photo.");
    expect(validateInspirationFile({ type: "image/gif", size: 1000 })).toBe("Choose a JPG, PNG or WebP photo.");
  });

  it("rejects empty and too-big files", () => {
    expect(validateInspirationFile({ type: "image/png", size: 0 })).toContain("empty");
    expect(validateInspirationFile({ type: "image/png", size: MAX_INSPIRATION_BYTES + 1 })).toContain("5 MB");
  });
});