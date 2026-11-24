const wholeNaira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});
const nairaAndKobo = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Input is KOBO (whole number). 4500000 becomes "₦45,000"; 125050 becomes "₦1,250.50"
export function naira(kobo: number): string {
  const value = kobo / 100;
  return (Number.isInteger(value) ? wholeNaira : nairaAndKobo).format(value);
}
const dateTime = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Lagos", // the business runs on Lagos time (Section 3)
});

// "2026-11-23T10:12:00+01:00" becomes something like "23 Nov 2026, 10:12 am"
export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}
const timeOnly = new Intl.DateTimeFormat("en-NG", { timeStyle: "short", timeZone: "Africa/Lagos" });
const dateLong = new Intl.DateTimeFormat("en-NG", { dateStyle: "full", timeZone: "Africa/Lagos" });

// "2026-12-02T10:00:00+01:00" becomes something like "10:00 am"
export function formatTime(iso: string): string {
  return timeOnly.format(new Date(iso));
}

// "2026-12-02" becomes something like "Wednesday, 2 December 2026". Noon avoids any midnight edge case
export function formatDateLong(date: string): string {
  return dateLong.format(new Date(`${date}T12:00:00+01:00`));
}