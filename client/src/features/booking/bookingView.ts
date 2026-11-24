import { formatDateLong, formatTime } from "../../lib/format";
import { lagosDateString } from "../../lib/lagosDate";
import type { ServicesResponse } from "../../shared";
import { emptyDraft, findBookable, type BookingDraft } from "./bookingDraft";

// Only the fields we use. The shared Booking type fits this
export type BookingFacts = {
  status: string;
  startAt: string;
  locationType: string;
  serviceId?: string | null;
  packageId?: string | null;
  travelZoneId?: string | null;
  address?: string | null;
  city?: string | null;
  landmark?: string | null;
  travelFeeKobo: number;
  isBridal: boolean;
  depositRequiredKobo: number;
  depositPaid: boolean;
  holdExpiresAt?: string | null;
};

const STATUS: Record<string, { label: string; help: string }> = {
  pending: { label: "Waiting for confirmation", help: "The owner has not confirmed this booking yet. She replies on WhatsApp." },
  confirmed: { label: "Confirmed", help: "The owner has confirmed this booking." },
  cancelled: { label: "Cancelled", help: "This booking is cancelled." },
  completed: { label: "Done", help: "This appointment is done." },
  no_show: { label: "Missed", help: "This appointment was marked as missed." },
};

export function statusInfo(status: string): { label: string; help: string } {
  return STATUS[status] ?? { label: status, help: "" };
}

// Only a waiting or confirmed booking can still be changed
export function canChange(status: string): boolean {
  return status === "pending" || status === "confirmed";
}

export type BookingView = {
  name: string | null; // null when the service is not in the list any more
  durationMin: number | null;
  priceKobo: number | null;
  travelFeeKobo: number;
  totalKobo: number | null;
  when: string;
  where: string;
  statusLabel: string;
  statusHelp: string;
  holdText: string | null;
  deposit: { amountKobo: number; received: boolean } | null;
};

export function describeBooking(
  facts: BookingFacts,
  services: ServicesResponse | undefined,
  zones: ReadonlyArray<{ id: string; name: string }> | undefined,
  now: number = Date.now(), // a parameter so a test can fix the time
): BookingView {
  const id = facts.packageId ?? facts.serviceId ?? null;
  const item = services && id ? findBookable(services, facts.packageId ? "package" : "service", id) : null;
  const priceKobo = item ? item.priceKobo : null;

  // Dates are shown in Lagos time, whatever the device clock says
  const when = `${formatDateLong(lagosDateString(Date.parse(facts.startAt)))}, ${formatTime(facts.startAt)}`;

  let where = "At the salon";
  if (facts.locationType === "home") {
    const zoneName = zones?.find((zone) => zone.id === facts.travelZoneId)?.name;
    const place = [facts.address, facts.city].filter((part): part is string => Boolean(part)).join(", ");
    where = `At your place${zoneName ? ` (${zoneName})` : ""}${place ? `: ${place}` : ""}`;
  }

  const holdActive = facts.status === "pending" && facts.holdExpiresAt && Date.parse(facts.holdExpiresAt) > now;
  const holdText = holdActive
    ? `Your time is held for you until ${formatDateLong(lagosDateString(Date.parse(facts.holdExpiresAt as string)))}, ${formatTime(facts.holdExpiresAt as string)}.`
    : null;

  const info = statusInfo(facts.status);
  return {
    name: item ? item.name : null,
    durationMin: item ? item.durationMin : null,
    priceKobo,
    travelFeeKobo: facts.travelFeeKobo,
    totalKobo: priceKobo === null ? null : priceKobo + facts.travelFeeKobo,
    when,
    where,
    statusLabel: info.label,
    statusHelp: info.help,
    holdText,
    deposit: facts.isBridal && facts.depositRequiredKobo > 0 ? { amountKobo: facts.depositRequiredKobo, received: facts.depositPaid } : null,
  };
}

// The starting state for the reschedule panel: same service, place and area. The customer chooses a new date and time
export function draftFromBooking(
  facts: Pick<BookingFacts, "serviceId" | "packageId" | "locationType" | "travelZoneId">,
): BookingDraft | null {
  const id = facts.packageId ?? facts.serviceId ?? null;
  if (!id) return null;
  if (facts.locationType !== "salon" && facts.locationType !== "home") return null;
  return {
    ...emptyDraft,
    kind: facts.packageId ? "package" : "service",
    itemId: id,
    locationType: facts.locationType,
    travelZoneId: facts.locationType === "home" ? (facts.travelZoneId ?? null) : null,
  };
}

// The server built the WhatsApp message and put it in the link. We read it back so the customer can see it
export function messageFromWhatsappUrl(url: string): string | null {
  try {
    return new URL(url).searchParams.get("text");
  } catch {
    return null;
  }
}