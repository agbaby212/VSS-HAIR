import { beforeEach, describe, expect, it } from "vitest";
import { loadConfirmation, readConfirmationState, saveConfirmation } from "./confirmationStore";

const info = { whatsappUrl: "https://wa.me/2348000000000?text=Hello", manageToken: "secret-token" };

describe("confirmationStore", () => {
  beforeEach(() => sessionStorage.clear());

  it("saves and loads the info for one booking", () => {
    saveConfirmation("BK-1", info);
    expect(loadConfirmation("BK-1")).toEqual(info);
    expect(loadConfirmation("BK-2")).toBeNull();
  });

  it("returns null for damaged text", () => {
    sessionStorage.setItem("vss_booking_BK-1", "{not json");
    expect(loadConfirmation("BK-1")).toBeNull();
  });

  it("accepts only the right shape", () => {
    expect(readConfirmationState(info)).toEqual(info);
    expect(readConfirmationState({ whatsappUrl: "x" })).toBeNull();
    expect(readConfirmationState(null)).toBeNull();
    expect(readConfirmationState("text")).toBeNull();
  });
});