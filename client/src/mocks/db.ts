import type {
  Booking, CheckoutInput, CreateBookingInput, Order, PageMeta, Product, Slot, TrackedOrder, TravelZone, Variant,
} from "../shared";
import { MockApiError } from "./errors";
import { createSeed } from "./seed";
import { generateSlots, lagosDate, lagosIso, type BusyRange } from "./slots";

const HOUR_MS = 3_600_000;
const MIN_MS = 60_000;

type StoredBooking = Booking & { blockStart: number }; // blockStart = start minus travel buffer (ms)
type OrderLine = { variantId: string; qty: number }; // remembered so a cancelled order can restore stock

function createState(now: Date = new Date()) {
  return {
    ...createSeed(now),
    orders: [] as Order[],
    orderLines: {} as Record<string, OrderLine[]>,
    bookings: [] as StoredBooking[],
    counters: { order: 10482, booking: 20931 },
  };
}

let state = createState();

export function getState() {
  return state;
}
// Used by tests, and handy in the console while developing
export function resetDb(now: Date = new Date()): void {
  state = createState(now);
}

/* ------------------------------- helpers ------------------------------ */

export function variantLabel(v: Variant): string | null {
  const parts = [v.lengthIn ? `${v.lengthIn} inch` : null, v.color, v.density, v.size].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

function findVariant(variantId: string): { product: Product; variant: Variant } | null {
  for (const product of state.products) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) return { product, variant };
  }
  return null;
}

// The shop only sees active products and active variants
function publicProduct(p: Product): Product {
  return { ...p, variants: p.variants.filter((v) => v.isActive) };
}

/* ------------------------------ catalogue ----------------------------- */

export type ProductFilters = {
  category?: string; texture?: string; minPrice?: number; maxPrice?: number;
  color?: string; length?: number; q?: string; page: number; pageSize: number;
};

export function listProducts(f: ProductFilters): { items: Product[]; meta: PageMeta } {
  const variantFilterOn =
    f.minPrice !== undefined || f.maxPrice !== undefined || f.color !== undefined || f.length !== undefined;

  // Price, colour and length must all match on the SAME variant (like one SQL row)
  const variantMatches = (v: Variant): boolean =>
    v.isActive &&
    (f.minPrice === undefined || v.priceKobo >= f.minPrice) &&
    (f.maxPrice === undefined || v.priceKobo <= f.maxPrice) &&
    (f.color === undefined || v.color?.toLowerCase() === f.color.toLowerCase()) &&
    (f.length === undefined || v.lengthIn === f.length);

  const q = f.q?.toLowerCase();
  const matched = state.products.filter((p) => {
    if (!p.isActive) return false;
    if (f.category && p.category !== f.category) return false;
    if (f.texture && p.texture?.toLowerCase() !== f.texture.toLowerCase()) return false;
    if (q && !`${p.name} ${p.texture ?? ""} ${p.description ?? ""}`.toLowerCase().includes(q)) return false;
    if (variantFilterOn && !p.variants.some(variantMatches)) return false;
    return true;
  });

  const start = (f.page - 1) * f.pageSize;
  return {
    items: matched.slice(start, start + f.pageSize).map(publicProduct),
    meta: { page: f.page, pageSize: f.pageSize, total: matched.length, totalPages: Math.max(1, Math.ceil(matched.length / f.pageSize)) },
  };
}

export function getProduct(slug: string): Product | null {
  const product = state.products.find((p) => p.slug === slug && p.isActive);
  return product ? publicProduct(product) : null;
}

/* -------------------------------- orders ------------------------------ */

export function createOrder(input: CheckoutInput, now: Date = new Date()): Order {
  releaseExpiredHolds(now);

  // Add up repeated lines for the same variant, so two lines cannot dodge the stock check
  const wanted = new Map<string, number>();
  for (const line of input.items) wanted.set(line.variantId, (wanted.get(line.variantId) ?? 0) + line.qty);

  // Pass 1: check everything. Nothing changes yet
  const lines = [...wanted.entries()].map(([variantId, qty]) => {
    const found = findVariant(variantId);
    if (!found || !found.product.isActive || !found.variant.isActive) {
      throw new MockApiError(404, "NOT_FOUND", "One of the items in your bag is no longer sold. Remove it and try again.");
    }
    const label = [found.product.name, variantLabel(found.variant)].filter(Boolean).join(" (") + (variantLabel(found.variant) ? ")" : "");
    if (found.variant.stock < qty) {
      const message = found.variant.stock === 0 ? `${label} is sold out.` : `Only ${found.variant.stock} left of ${label}.`;
      throw new MockApiError(409, "OUT_OF_STOCK", message);
    }
    return { ...found, qty, label };
  });

  // The fee comes from OUR data, never from the browser
  let deliveryFeeKobo = 0;
  let zoneState: string | null = null;
  if (input.fulfilment === "delivery") {
    const zone = state.deliveryZones.find((z) => z.state.toLowerCase() === (input.state ?? "").toLowerCase());
    if (!zone) throw new MockApiError(422, "AREA_NOT_COVERED", `We do not deliver to ${input.state ?? "that state"} yet. Choose another state or pick up in person.`);
    deliveryFeeKobo = zone.feeKobo;
    zoneState = zone.state;
  }

  // Pass 2: apply. This is the "one transaction"
  for (const line of lines) line.variant.stock -= line.qty;

  const subtotalKobo = lines.reduce((sum, l) => sum + l.variant.priceKobo * l.qty, 0);
  const order: Order = {
    id: crypto.randomUUID(),
    orderNumber: `VSS-${state.counters.order++}`,
    customerName: input.customerName,
    customerPhone: input.phone,
    customerEmail: input.email ?? null,
    fulfilment: input.fulfilment,
    state: zoneState,
    city: input.fulfilment === "delivery" ? (input.city ?? null) : null,
    address: input.fulfilment === "delivery" ? (input.address ?? null) : null,
    deliveryFeeKobo,
    subtotalKobo,
    totalKobo: subtotalKobo + deliveryFeeKobo,
    status: "pending", // only the owner can change this (admin, FE-T12)
    holdExpiresAt: lagosIso(now.getTime() + state.settings.orderHoldHours * HOUR_MS),
    paidAt: null,
    courierTracking: null,
    notes: input.notes ?? null,
    createdAt: lagosIso(now.getTime()),
    items: lines.map((l) => ({
      productName: l.product.name,
      variantLabel: variantLabel(l.variant),
      unitPriceKobo: l.variant.priceKobo, // copied now, so history stays right if prices change
      qty: l.qty,
    })),
  };
  state.orders.unshift(order);
  state.orderLines[order.id] = lines.map((l) => ({ variantId: l.variant.id, qty: l.qty }));
  return order;
}

export function trackOrder(orderNumber: string, phone: string): TrackedOrder | null {
  const order = state.orders.find((o) => o.orderNumber === orderNumber && o.customerPhone === phone);
  if (!order) return null;
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    fulfilment: order.fulfilment,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    totalKobo: order.totalKobo,
    courierTracking: order.courierTracking,
    items: order.items,
  };
}

// Frees stock and slots whose payment time ran out. Safe to call many times: each hold is freed once
export function releaseExpiredHolds(now: Date = new Date()): number {
  let released = 0;
  for (const order of state.orders) {
    if (order.status !== "pending" || !order.holdExpiresAt || Date.parse(order.holdExpiresAt) > now.getTime()) continue;
    order.status = "cancelled";
    for (const line of state.orderLines[order.id] ?? []) {
      const found = findVariant(line.variantId);
      if (found) found.variant.stock += line.qty;
    }
    released += 1;
  }
  for (const booking of state.bookings) {
    if (booking.status !== "pending" || !booking.holdExpiresAt || Date.parse(booking.holdExpiresAt) > now.getTime()) continue;
    booking.status = "cancelled";
    released += 1;
  }
  return released;
}

/* ------------------------------- bookings ----------------------------- */

type Bookable = { id: string; kind: "service" | "package"; name: string; durationMin: number; priceKobo: number; homeEligible: boolean; isBridal: boolean };

function findBookable(serviceId?: string, packageId?: string): Bookable | null {
  const service = serviceId ? state.services.find((s) => s.id === serviceId) : undefined;
  if (service) return { ...service, kind: "service" };
  const pack = packageId ? state.packages.find((p) => p.id === packageId) : undefined;
  return pack ? { ...pack, kind: "package" } : null;
}

function resolveHomeZone(item: Bookable, travelZoneId?: string): TravelZone {
  if (!item.homeEligible) {
    throw new MockApiError(400, "VALIDATION_ERROR", "This service is only done at the salon.", [
      { path: "locationType", message: "Choose the salon for this service" },
    ]);
  }
  const zone = state.travelZones.find((z) => z.id === travelZoneId);
  if (!zone) {
    throw new MockApiError(422, "AREA_NOT_COVERED", "We do not travel to that area yet. Choose another area or book at the salon.");
  }
  return zone;
}

function busyRanges(): BusyRange[] {
  return state.bookings
    .filter((b) => b.status === "pending" || b.status === "confirmed") // live bookings only
    .map((b) => ({ start: b.blockStart, end: Date.parse(b.endAt) }));
}

export type SlotQuery = { serviceId?: string; packageId?: string; date: string; locationType: "salon" | "home"; travelZoneId?: string };

export function getSlots(query: SlotQuery, now: Date = new Date()): Slot[] {
  const item = findBookable(query.serviceId, query.packageId);
  if (!item) throw new MockApiError(404, "NOT_FOUND", "We could not find that service.");
  const isHome = query.locationType === "home";
  const zone = isHome ? resolveHomeZone(item, query.travelZoneId) : null;
  return generateSlots({
    date: query.date, durationMin: item.durationMin, bufferMin: zone?.travelBufferMin ?? 0,
    isHome, isBridal: item.isBridal, rules: { ...state.availability, slotMinutes: state.settings.slotMinutes, minNoticeHoursHome: state.settings.minNoticeHoursHome },
    busy: busyRanges(), now,
  });
}

export function createBooking(input: CreateBookingInput, now: Date = new Date()): Booking {
  releaseExpiredHolds(now);

  const item = findBookable(input.serviceId, input.packageId);
  if (!item) throw new MockApiError(404, "NOT_FOUND", "We could not find that service.");

  const isHome = input.locationType === "home";
  const zone = isHome ? resolveHomeZone(item, input.home?.travelZoneId) : null;
  const bufferMs = (zone?.travelBufferMin ?? 0) * MIN_MS;

  if (item.isBridal && !input.bridal) {
    throw new MockApiError(400, "VALIDATION_ERROR", "Bridal bookings need a few more details.", [
      { path: "bridal", message: "Add the event date, venue, call time and party size" },
    ]);
  }
  if (item.isBridal && input.bridal && state.availability.bridalBlocks.includes(input.bridal.eventDate)) {
    throw new MockApiError(409, "SLOT_TAKEN", "That bridal date is already booked. Choose another date.");
  }

  const startMs = Date.parse(input.startAt);
  const endMs = startMs + item.durationMin * MIN_MS;
  const blockStart = startMs - bufferMs;
  const blockEnd = endMs + bufferMs;

  // Same job as the database exclusion constraint: no overlap with a live booking
  if (busyRanges().some((b) => blockStart < b.end && blockEnd > b.start)) {
    throw new MockApiError(409, "SLOT_TAKEN", "That time was just taken. Please choose another time.");
  }
  const open = getSlots({ serviceId: input.serviceId, packageId: input.packageId, date: lagosDate(startMs), locationType: input.locationType, travelZoneId: input.home?.travelZoneId }, now);
  if (!open.some((s) => Date.parse(s.startAt) === startMs)) {
    throw new MockApiError(400, "VALIDATION_ERROR", "That time is not available. Choose another time.", [
      { path: "startAt", message: "Pick one of the times shown" },
    ]);
  }

  const isBridal = item.isBridal && Boolean(input.bridal);
  const holdHours = isBridal ? state.settings.bridalHoldHours : state.settings.bookingHoldHours;
  const booking: StoredBooking = {
    id: crypto.randomUUID(),
    bookingRef: `BK-${state.counters.booking++}`,
    manageToken: crypto.randomUUID().replaceAll("-", ""),
    customerName: input.customerName,
    customerPhone: input.phone,
    itemName: item.name,
    serviceId: item.kind === "service" ? item.id : null,
    packageId: item.kind === "package" ? item.id : null,
    locationType: input.locationType,
    address: input.home?.address ?? null,
    state: input.home?.state ?? null,
    city: input.home?.city ?? null,
    landmark: input.home?.landmark ?? null,
    priceKobo: item.priceKobo,
    travelFeeKobo: zone?.feeKobo ?? 0,
    startAt: lagosIso(startMs),
    endAt: lagosIso(endMs + bufferMs), // includes the buffer after, as the schema says
    status: "pending",
    holdExpiresAt: lagosIso(now.getTime() + holdHours * HOUR_MS),
    isBridal,
    eventDate: isBridal ? (input.bridal?.eventDate ?? null) : null,
    venue: isBridal ? (input.bridal?.venue ?? null) : null,
    callTime: isBridal ? (input.bridal?.callTime ?? null) : null,
    partySize: isBridal ? (input.bridal?.partySize ?? null) : null,
    trialSession: isBridal ? (input.bridal?.trialSession ?? false) : false,
    depositRequiredKobo: isBridal ? Math.round((item.priceKobo * state.settings.deposit.bridalPercent) / 100) : 0,
    depositPaid: false, // only the owner can set this (admin, FE-T12)
    notes: input.notes ?? null,
    createdAt: lagosIso(now.getTime()),
    blockStart,
  };
  state.bookings.push(booking);
  return booking;
}

export function findBookingByToken(token: string): Booking | null {
  return state.bookings.find((b) => b.manageToken === token) ?? null;
}