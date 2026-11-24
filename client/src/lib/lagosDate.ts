const HOUR_MS = 3_600_000;

// "Today" in Lagos for a given moment (milliseconds). Lagos is UTC+1 with no daylight saving
export function lagosDateString(ms: number): string {
  return new Date(ms + HOUR_MS).toISOString().slice(0, 10);
}

// Noon UTC: no timezone can push the result over midnight
export function addDaysToDate(date: string, days: number): string {
  const result = new Date(`${date}T12:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

// Is it a real calendar date ("2026-02-31" is not), and between min and max (both inclusive)?
export function isDateInRange(date: string, min: string, max: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return false;
  return date >= min && date <= max; // YYYY-MM-DD text sorts in date order
}