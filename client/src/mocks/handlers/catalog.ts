import { http } from "msw";
import { z } from "zod";
import {
  deliveryZoneSchema, productSchema, PRODUCT_CATEGORIES, publicSettingsSchema, reviewSchema, servicesResponseSchema, travelZoneSchema,
} from "../../shared";
import { getProduct, getState, listProducts } from "../db";
import { api, fail, guard, ok, okPage, queryObject, validationFail } from "../helpers";

// z.coerce turns the text "20" from the URL into the number 20
const productsQuery = z.object({
  category: z.enum(PRODUCT_CATEGORIES).optional(),
  texture: z.string().optional(),
  minPrice: z.coerce.number().int().min(0).optional(), // kobo
  maxPrice: z.coerce.number().int().min(0).optional(), // kobo
  color: z.string().optional(),
  length: z.coerce.number().int().min(1).optional(), // inches
  q: z.string().max(80).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

export const catalogHandlers = [
  http.get(api("/health"), () => guard(() => ok(z.object({ status: z.literal("ok") }), { status: "ok" }))),

  http.get(api("/products"), ({ request }) =>
    guard(() => {
      const parsed = productsQuery.safeParse(queryObject(request.url));
      if (!parsed.success) return validationFail(parsed.error);
      const { items, meta } = listProducts(parsed.data);
      return okPage(productSchema, items, meta);
    }),
  ),

  http.get(api("/products/:slug"), ({ params }) =>
    guard(() => {
      const product = getProduct(String(params.slug));
      if (!product) return fail(404, "NOT_FOUND", "We could not find that product");
      return ok(productSchema, product);
    }),
  ),

  http.get(api("/delivery-zones"), () =>
    guard(() => ok(z.array(deliveryZoneSchema), getState().deliveryZones)),
  ),

  http.get(api("/services"), () =>
    guard(() => ok(servicesResponseSchema, { services: getState().services, packages: getState().packages })),
  ),

  http.get(api("/travel-zones"), () => guard(() => ok(z.array(travelZoneSchema), getState().travelZones))),

  http.get(api("/reviews"), () =>
    guard(() => ok(z.array(reviewSchema), [...getState().reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))),
  ),

  http.get(api("/settings/public"), () => guard(() => ok(publicSettingsSchema, getState().settings))),
];