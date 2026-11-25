import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearAdminToken, getAdminToken, isTokenExpired, setAdminToken, tokenExpiry } from "./adminToken";

// A fake token: header.payload.signature, with a real base64url payload
function fakeToken(payload: object): string {
  const part = btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `header.${part}.signature`;
}

const now = Date.parse("2026-12-01T10:00:00Z");
const inSeconds = (seconds: number) => Math.floor(now / 1000) + seconds;

describe("admin token storage", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("saves, reads and clears under vss_admin_token", () => {
    expect(setAdminToken("abc")).toBe(true);
    expect(localStorage.getItem("vss_admin_token")).toBe("abc");
    expect(getAdminToken()).toBe("abc");
    clearAdminToken();
    expect(getAdminToken()).toBeNull();
  });

  it("does not crash when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(getAdminToken()).toBeNull();
    expect(setAdminToken("abc")).toBe(false);
  });
});

describe("isTokenExpired", () => {
  it("is false while the token has time left", () => {
    expect(isTokenExpired(fakeToken({ exp: inSeconds(3600) }), now)).toBe(false);
  });

  it("is true once the time has passed", () => {
    expect(isTokenExpired(fakeToken({ exp: inSeconds(-1) }), now)).toBe(true);
  });

  it("is true inside the 10 second margin", () => {
    expect(isTokenExpired(fakeToken({ exp: inSeconds(5) }), now)).toBe(true);
  });

  it("treats a token it cannot read as usable, because the server decides", () => {
    expect(isTokenExpired("not-a-token", now)).toBe(false);
    expect(isTokenExpired("a.%%%.c", now)).toBe(false);
    expect(isTokenExpired(fakeToken({ sub: "owner" }), now)).toBe(false); // no exp
    expect(isTokenExpired(fakeToken({ exp: "soon" }), now)).toBe(false); // exp is not a number
  });
});

describe("tokenExpiry", () => {
  it("returns the JWT expiry in milliseconds", () => {
    const exp = inSeconds(3600);
    expect(tokenExpiry(fakeToken({ exp }))).toBe(exp * 1000);
  });

  it("returns null when the token has no readable expiry", () => {
    expect(tokenExpiry("not-a-token")).toBeNull();
    expect(tokenExpiry(fakeToken({ sub: "owner" }))).toBeNull();
  });
});