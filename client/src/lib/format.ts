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