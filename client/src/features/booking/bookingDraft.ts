import type { Package, Service, ServicesResponse } from "../../shared";

export type ItemKind = "service" | "package";
export type LocationType = "salon" | "home";

// Everything the customer has chosen so far (steps 1 to 3). Step 4 adds their details in part 2
export type BookingDraft = {
  kind: ItemKind | null;
  itemId: string | null;
  locationType: LocationType | null;
  travelZoneId: string | null; // only for a home visit
  date: string | null; // "2026-12-02", a Lagos date
  slotStart: string | null; // the chosen time, as the server sent it
};

export const emptyDraft: BookingDraft = {
  kind: null, itemId: null, locationType: null, travelZoneId: null, date: null, slotStart: null,
};

export type BookingAction =
  | { type: "chooseItem"; kind: ItemKind; id: string; homeEligible: boolean }
  | { type: "chooseLocation"; locationType: LocationType }
  | { type: "chooseZone"; travelZoneId: string | null }
  | { type: "chooseDate"; date: string | null }
  | { type: "chooseSlot"; slotStart: string | null };

// The free times depend on the service, the place, the area and the date.
// So if one of those changes, the chosen time may be wrong, and it is cleared
export function bookingReducer(draft: BookingDraft, action: BookingAction): BookingDraft {
  switch (action.type) {
    case "chooseItem": {
      const next = { ...draft, kind: action.kind, itemId: action.id, slotStart: null };
      // A salon-only service cannot keep "at my place"
      if (!action.homeEligible && draft.locationType === "home") return { ...next, locationType: null, travelZoneId: null };
      return next;
    }
    case "chooseLocation":
      return {
        ...draft,
        locationType: action.locationType,
        travelZoneId: action.locationType === "salon" ? null : draft.travelZoneId,
        slotStart: null,
      };
    case "chooseZone":
      return { ...draft, travelZoneId: action.travelZoneId, slotStart: null };
    case "chooseDate":
      return { ...draft, date: action.date, slotStart: null };
    case "chooseSlot":
      return { ...draft, slotStart: action.slotStart };
  }
}

export type Step = 1 | 2 | 3 | 4;

// Can the customer press Continue on this step?
export function isStepComplete(step: Step, draft: BookingDraft): boolean {
  switch (step) {
    case 1:
      return draft.itemId !== null;
    case 2:
      return draft.locationType === "salon" || (draft.locationType === "home" && draft.travelZoneId !== null);
    case 3:
      return draft.date !== null && draft.slotStart !== null;
    case 4:
      return true; // part 2 decides
  }
}

// A service or a package, in one shape, so the rest of the wizard does not care which it is
export type Bookable = {
  kind: ItemKind;
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  priceKobo: number;
  homeEligible: boolean;
  isBridal: boolean;
};

export function findBookable(data: ServicesResponse, kind: ItemKind, id: string): Bookable | null {
  const found: Service | Package | undefined =
    kind === "service" ? data.services.find((item) => item.id === id) : data.packages.find((item) => item.id === id);
  if (!found) return null;
  return {
    kind, id: found.id, name: found.name, description: found.description, durationMin: found.durationMin,
    priceKobo: found.priceKobo, homeEligible: found.homeEligible, isBridal: found.isBridal,
  };
}

// The starting state, from /book?service=<id> or /book?package=<id>. A wrong or missing id is ignored
export function initialDraft(data: ServicesResponse, serviceId: string | null, packageId: string | null): BookingDraft {
  if (serviceId && findBookable(data, "service", serviceId)) return { ...emptyDraft, kind: "service", itemId: serviceId };
  if (packageId && findBookable(data, "package", packageId)) return { ...emptyDraft, kind: "package", itemId: packageId };
  return emptyDraft;
}

// The question we ask the server for the free times (Section 6). null = not enough chosen yet
export type SlotParams = {
  serviceId?: string;
  packageId?: string;
  date: string;
  locationType: LocationType;
  travelZoneId?: string;
};

export function slotParams(draft: BookingDraft): SlotParams | null {
  if (!draft.kind || !draft.itemId || !draft.locationType || !draft.date) return null;
  if (draft.locationType === "home" && !draft.travelZoneId) return null;
  return {
    ...(draft.kind === "service" ? { serviceId: draft.itemId } : { packageId: draft.itemId }),
    date: draft.date,
    locationType: draft.locationType,
    ...(draft.locationType === "home" && draft.travelZoneId ? { travelZoneId: draft.travelZoneId } : {}),
  };
}