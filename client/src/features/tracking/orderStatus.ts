import type { OrderStatus, TrackedOrder } from "../../shared";

// What the customer sees (Section 3: "pending" is shown as "Awaiting payment")
export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Awaiting payment",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// The happy path, in order. "cancelled" is not on it
export const TIMELINE: OrderStatus[] = ["pending", "paid", "processing", "shipped", "delivered"];

export type StepState = "done" | "current" | "upcoming";

export function stepState(current: OrderStatus, step: OrderStatus): StepState {
  if (current === "delivered") return "done"; // the journey is finished, nothing is "now"
  const currentIndex = TIMELINE.indexOf(current);
  if (currentIndex === -1) return "upcoming"; // cancelled: there is no progress to show
  const stepIndex = TIMELINE.indexOf(step);
  if (stepIndex < currentIndex) return "done";
  return stepIndex === currentIndex ? "current" : "upcoming";
}

// One plain sentence per status. [REPLACE] the owner can change the wording
export function statusMessage(order: Pick<TrackedOrder, "status" | "courierTracking">): string {
  switch (order.status) {
    case "pending":
      return "We are waiting for your payment. Send your order message on WhatsApp, then pay by bank transfer to the account details the owner sends you.";
    case "paid":
      return "We have your payment. Your order will be prepared next.";
    case "processing":
      return "We are getting your order ready.";
    case "shipped":
      return order.courierTracking
        ? "Your order is on its way."
        : "Your order is on its way. The courier tracking number will show here when we have it.";
    case "delivered":
      return "Your order was delivered. Thank you for shopping with VSS Hair.";
    case "cancelled":
      return "This order was cancelled. If you think this is a mistake, message us on WhatsApp with your order number.";
  }
}