import type { Booking, Order } from "../shared";
import { naira } from "../lib/format";

function chatUrl(text: string): string {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER; // digits only. Empty gives a plain wa.me link
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function orderWhatsappUrl(order: Order): string {
  const lines = [
    "Hello VSS Hair, I want to place an order.",
    "",
    `Order: ${order.orderNumber}`,
    "Items:",
    ...order.items.map((i) => `- ${i.qty} x ${i.productName}${i.variantLabel ? ` (${i.variantLabel})` : ""}: ${naira(i.unitPriceKobo * i.qty)}`),
    order.fulfilment === "delivery" ? `Delivery to ${order.state}: ${naira(order.deliveryFeeKobo)}` : "Pickup: I will collect my order",
    `Total: ${naira(order.totalKobo)}`,
    "",
    `Name: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    ...(order.fulfilment === "delivery" ? [`Address: ${order.address}, ${order.city}, ${order.state}`] : []),
    "",
    "Please send your account details so I can pay.",
  ];
  return chatUrl(lines.join("\n"));
}

const whenFormat = new Intl.DateTimeFormat("en-NG", { dateStyle: "full", timeStyle: "short", timeZone: "Africa/Lagos" });

export function bookingWhatsappUrl(booking: Booking): string {
  const lines = [
    "Hello VSS Hair, I would like to book an appointment.",
    "",
    `Booking: ${booking.bookingRef}`,
    `Service: ${booking.itemName}`,
    `When: ${whenFormat.format(new Date(booking.startAt))}`,
    booking.locationType === "home" ? `Where: my place, ${booking.address}, ${booking.city}, ${booking.state}` : "Where: at the salon",
    `Price: ${naira(booking.priceKobo)}`,
    ...(booking.travelFeeKobo > 0 ? [`Travel fee: ${naira(booking.travelFeeKobo)}`] : []),
    ...(booking.isBridal
      ? [`Event date: ${booking.eventDate}`, `Venue: ${booking.venue}`, `Call time: ${booking.callTime}`,
         `Party size: ${booking.partySize}`, `Trial session: ${booking.trialSession ? "yes" : "no"}`]
      : []),
    ...(booking.depositRequiredKobo > 0 ? [`Deposit to pay: ${naira(booking.depositRequiredKobo)}`] : []),
    "",
    "Name: " + booking.customerName,
    "Phone: " + booking.customerPhone,
    "",
    booking.depositRequiredKobo > 0
      ? "Please send your account details so I can pay the deposit."
      : "Please confirm my appointment.",
  ];
  return chatUrl(lines.join("\n"));
}