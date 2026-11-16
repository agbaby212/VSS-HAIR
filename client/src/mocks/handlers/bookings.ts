import { http } from "msw";
import { z } from "zod";
import {
  bookingSchema, createBookingResponseSchema, createBookingSchema, LOCATION_TYPES, slotSchema, uploadResponseSchema,
} from "../../shared";
import { createBooking, findBookingByToken, getSlots } from "../db";
import { api, fail, guard, ok, queryObject, readJson, validationFail } from "../helpers";
import { bookingWhatsappUrl } from "../whatsappMessage";

const slotsQuery = z
  .object({
    serviceId: z.string().uuid().optional(),
    packageId: z.string().uuid().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date like 2026-12-05"),
    locationType: z.enum(LOCATION_TYPES),
    travelZoneId: z.string().uuid().optional(),
  })
  .refine((v) => v.serviceId || v.packageId, { message: "Choose a service or a package", path: ["serviceId"] });

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB, same as the real server (Section 3)
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const bookingHandlers = [
  http.get(api("/availability/slots"), ({ request }) =>
    guard(() => {
      const parsed = slotsQuery.safeParse(queryObject(request.url));
      if (!parsed.success) return validationFail(parsed.error);
      return ok(z.array(slotSchema), getSlots(parsed.data));
    }),
  ),

  http.post(api("/bookings"), ({ request }) =>
    guard(async () => {
      const parsed = createBookingSchema.safeParse(await readJson(request));
      if (!parsed.success) return validationFail(parsed.error);
      const booking = createBooking(parsed.data);
      return ok(createBookingResponseSchema, { booking, whatsappUrl: bookingWhatsappUrl(booking) }, 201);
    }),
  ),

  // Fixed path "manage" comes before any future "/bookings/:id"
  http.get(api("/bookings/manage/:token"), ({ params }) =>
    guard(() => {
      const booking = findBookingByToken(String(params.token));
      if (!booking) return fail(404, "NOT_FOUND", "We could not find that booking. Check the link in your message.");
      return ok(bookingSchema, booking);
    }),
  ),
  // PATCH /bookings/manage/:token is added in FE-T10, after CCR-1 is approved

  http.post(api("/uploads/inspiration"), ({ request }) =>
    guard(async () => {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return fail(400, "VALIDATION_ERROR", "Choose a photo to upload", [{ path: "file", message: "Choose a photo to upload" }]);
      if (!PHOTO_TYPES.includes(file.type)) return fail(400, "VALIDATION_ERROR", "Use a jpg, png or webp photo", [{ path: "file", message: "Use a jpg, png or webp photo" }]);
      if (file.size > MAX_PHOTO_BYTES) return fail(400, "VALIDATION_ERROR", "That photo is too big. The limit is 5 MB", [{ path: "file", message: "The limit is 5 MB" }]);
      // A made-up address. The real server returns a Cloudinary link
      return ok(uploadResponseSchema, { url: `https://res.cloudinary.com/mock/image/upload/inspiration-${crypto.randomUUID()}.jpg` }, 201);
    }),
  ),
];