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