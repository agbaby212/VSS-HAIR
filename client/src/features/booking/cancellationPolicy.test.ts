import { describe, expect, it } from "vitest";
import { readPolicy } from "./cancellationPolicy";

describe("readPolicy", () => {
  it("splits plain text into paragraphs at blank lines", () => {
    expect(readPolicy("Cancel 24 hours ahead.\n\nThe deposit is not returned.")).toEqual([
      "Cancel 24 hours ahead.",
      "The deposit is not returned.",
    ]);
  });

  it("accepts { text }", () => {
    expect(readPolicy({ text: "One rule." })).toEqual(["One rule."]);
  });

  it("returns null for empty, blank or unknown values", () => {
    expect(readPolicy("")).toBeNull();
    expect(readPolicy("  \n\n  ")).toBeNull();
    expect(readPolicy(undefined)).toBeNull();
    expect(readPolicy({ hours: 24 })).toBeNull();
    expect(readPolicy(42)).toBeNull();
  });
});