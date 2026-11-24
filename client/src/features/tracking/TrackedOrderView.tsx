import { OrderItems } from "../../components/shop/OrderItems";
import { CopyButton } from "../../components/ui/CopyButton";
import { formatDateTime, naira } from "../../lib/format";
import { whatsappChatUrl } from "../../lib/whatsapp";
import type { TrackedOrder } from "../../shared";
import { statusLabel, statusMessage } from "./orderStatus";
import { StatusTimeline } from "./StatusTimeline";

export function TrackedOrderView({ order }: { order: TrackedOrder }) {
  const cancelled = order.status === "cancelled";
  const showCourier =
    order.fulfilment === "delivery" && (order.status === "shipped" || order.status === "delivered" || order.courierTracking !== null);
  const help = whatsappChatUrl(`Hello VSS Hair, I have a question about my order ${order.orderNumber}.`);

  return (
    <div>
      <h2 className="font-display text-3xl">Order {order.orderNumber}</h2>
      <p className="mt-1">Placed {formatDateTime(order.createdAt)}</p>

      <p className="mt-5 font-display text-3xl text-gold-deep">{statusLabel(order.status, order.fulfilment)}</p>
      <p className="mt-2">{statusMessage(order)}</p>

      {showCourier && !cancelled && (
        <div className="mt-5 bg-sand p-4">
          <p className="font-medium">Courier tracking number</p>
          {order.courierTracking ? (
            <p className="mt-1 flex flex-wrap items-center gap-3">
              <strong className="break-all text-lg">{order.courierTracking}</strong>
              <CopyButton text={order.courierTracking} />
            </p>
          ) : (
            <p className="mt-1">Not added yet.</p>
          )}
        </div>
      )}

      {!cancelled && (
        <div className="mt-8">
          <StatusTimeline status={order.status} fulfilment={order.fulfilment} />
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-xl">Items</h3>
        <div className="mt-3">
          <OrderItems items={order.items} />
        </div>
        <p className="mt-4 flex items-baseline justify-between gap-4 border-t border-gold pt-3 text-lg font-medium">
          <span>Total</span>
          <span className="font-display text-2xl text-gold-deep">{naira(order.totalKobo)}</span>
        </p>
      </div>

      <a
        href={help}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex min-h-[2.75rem] items-center text-gold-deep underline underline-offset-4"
      >
        Ask about this order on WhatsApp
      </a>
    </div>
  );
}