import type { Slot } from "../shared";

export type WeeklyHours = { weekday: number; start: string; end: string }; // 0 = Sunday, "09:00"
export type SlotRules = {
  weeklyHours: WeeklyHours[];
  dayOffs: string[]; // "2026-12-25"
  bridalBlocks: string[]; // dates that already have a bridal booking
  slotMinutes: number;
  minNoticeHoursHome: number;
};
// Milliseconds. A range that is already taken, including travel time before and after
export type BusyRange = { start: number; end: number };

const HOUR_MS = 3_600_000;
const MIN_MS = 60_000;

// Lagos is UTC+1 all year, so a fixed offset is safe
export function lagosMs(date: string, time: string): number {
  return new Date(`${date}T${time}:00+01:00`).getTime();
}
export function lagosIso(ms: number): string {
  return new Date(ms + HOUR_MS).toISOString().replace(/\.\d{3}Z$/, "+01:00");
}
export function lagosDate(ms: number): string {
  return new Date(ms + HOUR_MS).toISOString().slice(0, 10);
}
// Noon avoids any edge case near midnight
function lagosWeekday(date: string): number {
  return new Date(`${date}T12:00:00+01:00`).getUTCDay();
}

export type SlotInput = {
  date: string; // "2026-12-02", a Lagos date
  durationMin: number;
  bufferMin: number; // 0 for the salon, the zone's buffer for a home visit
  isHome: boolean;
  isBridal: boolean;
  rules: SlotRules;
  busy: BusyRange[];
  now: Date; // passed in, so tests control the clock
};

export function generateSlots(input: SlotInput): Slot[] {
  const { date, durationMin, bufferMin, isHome, isBridal, rules, busy, now } = input;

  if (rules.dayOffs.includes(date)) return [];
  if (isBridal && rules.bridalBlocks.includes(date)) return [];

  // Home visits need notice. Salon visits only need to be in the future
  const earliest = now.getTime() + (isHome ? rules.minNoticeHoursHome * HOUR_MS : 0);
  const slots: Slot[] = [];

  for (const hours of rules.weeklyHours.filter((h) => h.weekday === lagosWeekday(date))) {
    const open = lagosMs(date, hours.start);
    const close = lagosMs(date, hours.end);

    // The appointment itself must finish by closing time (the last slot of the day)
    for (let start = open; start + durationMin * MIN_MS <= close; start += rules.slotMinutes * MIN_MS) {
      if (start < earliest) continue;
      const end = start + durationMin * MIN_MS;
      const blockStart = start - bufferMin * MIN_MS;
      const blockEnd = end + bufferMin * MIN_MS;
      // Two ranges overlap when each starts before the other ends
      if (busy.some((b) => blockStart < b.end && blockEnd > b.start)) continue;
      slots.push({ startAt: lagosIso(start), endAt: lagosIso(end) });
    }
  }
  return slots;
}