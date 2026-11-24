import { describe, expect, it } from "vitest";
import { isWhatsappUrl, messageFromWhatsappUrl } from "./whatsapp";

describe("isWhatsappUrl", () => {
  it("accepts a wa.me chat link", () => {
    expect(isWhatsappUrl("https://wa.me/2348012345678?text=Hello")).toBe(true);
  });

  it("accepts the WhatsApp send endpoint", () => {
    expect(isWhatsappUrl("https://api.whatsapp.com/send?phone=2348012345678&text=Hello")).toBe(true);
  });

  it("rejects look-alikes", () => {
    expect(isWhatsappUrl("http://wa.me/2348012345678")).toBe(false);
    expect(isWhatsappUrl("https://wa.me.evil.example/2348012345678")).toBe(false);
    expect(isWhatsappUrl("https://wa.me/2348012345678.evil.example")).toBe(false);
    expect(isWhatsappUrl("https://api.whatsapp.com/send?phone=not-a-number")).toBe(false);
    expect(isWhatsappUrl("https://evil.example/?next=https://wa.me/")).toBe(false);
    expect(isWhatsappUrl("javascript:alert(1)")).toBe(false);
  });
});

describe("messageFromWhatsappUrl", () => {
  it("gives back the original message, line breaks included", () => {
    const text = "Hello VSS Hair\nOrder: VSS-10482\nTotal: ₦92,500";
    expect(messageFromWhatsappUrl(`https://wa.me/2348012345678?text=${encodeURIComponent(text)}`)).toBe(text);
  });

  it("returns null when there is no message or the link is broken", () => {
    expect(messageFromWhatsappUrl("https://wa.me/2348012345678")).toBeNull();
    expect(messageFromWhatsappUrl("not a link")).toBeNull();
  });
});