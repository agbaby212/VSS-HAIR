import { http } from "msw";
import { checkoutSchema, createOrderResponseSchema, trackOrderSchema, trackedOrderSchema } from "../../shared";
import { createOrder, trackOrder } from "../db";
import { api, fail, guard, ok, readJson, validationFail } from "../helpers";
import { orderWhatsappUrl } from "../whatsappMessage";

export const orderHandlers = [
  // Fixed path first
  http.post(api("/orders/track"), ({ request }) =>
    guard(async () => {
      const parsed = trackOrderSchema.safeParse(await readJson(request));
      if (!parsed.success) return validationFail(parsed.error);
      const tracked = trackOrder(parsed.data.orderNumber, parsed.data.phone);
      // Same answer for a wrong number and a wrong phone: nobody can learn which part was right
      if (!tracked) return fail(404, "NOT_FOUND", "We could not find an order with those details. Check the order number and phone number.");
      return ok(trackedOrderSchema, tracked);
    }),
  ),

  http.post(api("/orders"), ({ request }) =>
    guard(async () => {
      const parsed = checkoutSchema.safeParse(await readJson(request));
      if (!parsed.success) return validationFail(parsed.error);
      const order = createOrder(parsed.data);
      return ok(createOrderResponseSchema, { order, whatsappUrl: orderWhatsappUrl(order) }, 201);
    }),
  ),
];