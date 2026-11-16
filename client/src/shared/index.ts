import { z } from "zod";

export const CONTRACT_VERSION = "1.0.0"; // bump on every change, identical in both folders

/* ------------------------------------------------------------------ */
/* Part 1: input schemas (frozen in Section 7, copied exactly)         */
/* ------------------------------------------------------------------ */

export const phoneSchema = z.string().trim()
  .transform((v) => v.replace(/[^\d+]/g, "").replace(/^\+/, ""))
  .transform((v) => (v.startsWith("0") ? "234" + v.slice(1) : v))
  .refine((v) => /^234[789]\d{9}$/.test(v), "Enter a Nigerian phone number, like 08012345678");

export const ORDER_STATUSES = ["pending","paid","processing","shipped","delivered","cancelled"] as const;
export const BOOKING_STATUSES = ["pending","confirmed","cancelled","completed","no_show"] as const;
export const LOCATION_TYPES = ["salon","home"] as const;

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2).max(80),
  phone: phoneSchema,
  email: z.string().trim().toLowerCase().email().optional(),
  fulfilment: z.enum(["delivery","pickup"]),
  state: z.string().trim().min(2).optional(),
  city: z.string().trim().min(2).max(80).optional(),
  address: z.string().trim().min(5).max(250).optional(),
  notes: z.string().trim().max(500).optional(),
  items: z.array(z.object({ variantId: z.string().uuid(), qty: z.number().int().min(1).max(20) })).min(1),
}).refine((v) => v.fulfilment === "pickup" || (v.state && v.city && v.address),
  { message: "Delivery needs a state, city and address", path: ["address"] });

export const trackOrderSchema = z.object({ orderNumber: z.string().trim().toUpperCase(), phone: phoneSchema });

export const createBookingSchema = z.object({
  serviceId: z.string().uuid().optional(),
  packageId: z.string().uuid().optional(),
  locationType: z.enum(LOCATION_TYPES),
  startAt: z.string().datetime({ offset: true }),
  customerName: z.string().trim().min(2).max(80),
  phone: phoneSchema,
  notes: z.string().trim().max(500).optional(),
  inspirationUrl: z.string().url().optional(),
  home: z.object({ travelZoneId: z.string().uuid(), state: z.string(), city: z.string(),
    address: z.string().min(5).max(250), landmark: z.string().max(120).optional() }).optional(),
  bridal: z.object({ eventDate: z.string().date(), venue: z.string().min(2).max(160),
    callTime: z.string().regex(/^\d{2}:\d{2}$/), partySize: z.number().int().min(1).max(30),
    trialSession: z.boolean() }).optional(),
}).refine((v) => v.serviceId || v.packageId, { message: "Choose a service or a package" })
  .refine((v) => v.locationType !== "home" || v.home, { message: "Home service needs an address", path: ["home"] });

export const adminLoginSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) });

/* ------------------------------------------------------------------ */
/* Part 2: response schemas (money is always whole KOBO)               */
/* ------------------------------------------------------------------ */

const id = z.string().uuid();
const isoDateTime = z.string().datetime({ offset: true });
const kobo = z.number().int().min(0);

// The API wraps every success in { data } (Section 6)
export function dataEnvelope<T extends z.ZodTypeAny>(
  schema: T,
) {
  return z.object({ data: schema }).required();
}

export const pageMetaSchema = z.object({
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
});
export type PageMeta = z.infer<typeof pageMetaSchema>;

export const apiErrorBodySchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
  }),
});

// Shop
export const PRODUCT_CATEGORIES = ["bundles","frontals_closures","wigs","extensions","hair_care"] as const;

// "url" is a plain string, not .url(), so local photos like /photos/hero.jpg are allowed
export const mediaSchema = z.object({ url: z.string().min(1), type: z.enum(["image","video"]) });

export const variantSchema = z.object({
  id,
  productId: id,
  sku: z.string().nullable(),
  lengthIn: z.number().int().nullable(),
  color: z.string().nullable(),
  density: z.string().nullable(),
  size: z.string().nullable(),
  priceKobo: kobo,
  stock: z.number().int().min(0),
  isActive: z.boolean(),
});

export const productSchema = z.object({
  id,
  slug: z.string(),
  name: z.string(),
  category: z.enum(PRODUCT_CATEGORIES),
  texture: z.string().nullable(),
  description: z.string().nullable(),
  media: z.array(mediaSchema),
  isActive: z.boolean(),
  variants: z.array(variantSchema),
});

export const deliveryZoneSchema = z.object({
  id,
  state: z.string(),
  feeKobo: kobo,
  etaDaysMin: z.number().int(),
  etaDaysMax: z.number().int(),
});

// Orders
export const orderItemSchema = z.object({
  productName: z.string(),
  variantLabel: z.string().nullable(),
  unitPriceKobo: kobo,
  qty: z.number().int().min(1),
});

export const orderSchema = z.object({
  id,
  orderNumber: z.string(), // VSS-10482
  customerName: z.string(),
  customerPhone: z.string(),
  customerEmail: z.string().nullable(),
  fulfilment: z.enum(["delivery","pickup"]),
  state: z.string().nullable(),
  city: z.string().nullable(),
  address: z.string().nullable(),
  deliveryFeeKobo: kobo,
  subtotalKobo: kobo,
  totalKobo: kobo,
  status: z.enum(ORDER_STATUSES),
  holdExpiresAt: isoDateTime.nullable(),
  paidAt: isoDateTime.nullable(),
  courierTracking: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: isoDateTime,
  items: z.array(orderItemSchema),
});

export const createOrderResponseSchema = z.object({
  order: orderSchema,
  whatsappUrl: z.string().url(), // built by the server, never by the browser
});

// Tracking is public, so it returns the minimum: no phone, no address
export const trackedOrderSchema = z.object({
  orderNumber: z.string(),
  status: z.enum(ORDER_STATUSES),
  createdAt: isoDateTime,
  paidAt: isoDateTime.nullable(),
  totalKobo: kobo,
  courierTracking: z.string().nullable(),
  items: z.array(orderItemSchema),
});

// Services and bookings
export const SERVICE_CATEGORIES = ["hair","bridal","makeup","nails_feet"] as const;

export const serviceSchema = z.object({
  id,
  name: z.string(),
  category: z.enum(SERVICE_CATEGORIES),
  description: z.string().nullable(),
  durationMin: z.number().int().min(1),
  priceKobo: kobo,
  homeEligible: z.boolean(),
  isBridal: z.boolean(),
});

export const packageSchema = z.object({
  id,
  name: z.string(),
  description: z.string().nullable(),
  includes: z.array(z.string()),
  durationMin: z.number().int().min(1),
  priceKobo: kobo,
  homeEligible: z.boolean(),
  isBridal: z.boolean(),
});

export const servicesResponseSchema = z.object({
  services: z.array(serviceSchema),
  packages: z.array(packageSchema),
});

export const travelZoneSchema = z.object({
  id,
  name: z.string(),
  areas: z.array(z.string()),
  feeKobo: kobo,
  travelBufferMin: z.number().int().min(0),
});

export const slotSchema = z.object({ startAt: isoDateTime, endAt: isoDateTime });

export const bookingSchema = z.object({
  id,
  bookingRef: z.string(), // BK-20931
  manageToken: z.string(), // secret in the manage link
  customerName: z.string(),
  customerPhone: z.string(),
  itemName: z.string(), // the service or package name, for display
  serviceId: id.nullable(),
  packageId: id.nullable(),
  locationType: z.enum(LOCATION_TYPES),
  address: z.string().nullable(),
  state: z.string().nullable(),
  city: z.string().nullable(),
  landmark: z.string().nullable(),
  priceKobo: kobo,
  travelFeeKobo: kobo,
  startAt: isoDateTime,
  endAt: isoDateTime,
  status: z.enum(BOOKING_STATUSES),
  holdExpiresAt: isoDateTime.nullable(),
  isBridal: z.boolean(),
  eventDate: z.string().nullable(),
  venue: z.string().nullable(),
  callTime: z.string().nullable(),
  partySize: z.number().int().nullable(),
  trialSession: z.boolean(),
  depositRequiredKobo: kobo,
  depositPaid: z.boolean(),
  notes: z.string().nullable(),
  createdAt: isoDateTime,
});

export const createBookingResponseSchema = z.object({
  booking: bookingSchema,
  whatsappUrl: z.string().url(),
});

// Reviews and settings
export const reviewSchema = z.object({
  id,
  author: z.string(),
  rating: z.number().int().min(1).max(5),
  body: z.string(),
  avatarUrl: z.string().nullable(),
  createdAt: isoDateTime,
});

export const publicSettingsSchema = z.object({
  business: z.object({
    name: z.string(),
    city: z.string(),
    address: z.string(),
    hoursText: z.string(),
  }),
  awayMode: z.boolean(),
  deposit: z.object({ bridalPercent: z.number().int().min(0).max(100) }),
  cancellationPolicy: z.object({ freeCancelHours: z.number().int().min(0), text: z.string() }),
  slotMinutes: z.number().int().min(5),
  minNoticeHoursHome: z.number().int().min(0),
  orderHoldHours: z.number().int().min(1),
  bookingHoldHours: z.number().int().min(1),
  bridalHoldHours: z.number().int().min(1),
});

export const adminLoginResponseSchema = z.object({ token: z.string().min(1) });

export const uploadResponseSchema = z.object({ url: z.string().url() });

/* ------------------------------------------------------------------ */
/* Part 3: inferred types                                              */
/* ------------------------------------------------------------------ */

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type TrackOrderInput = z.infer<typeof trackOrderSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export type Variant = z.infer<typeof variantSchema>;
export type Product = z.infer<typeof productSchema>;
export type DeliveryZone = z.infer<typeof deliveryZoneSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type Order = z.infer<typeof orderSchema>;
export type CreateOrderResponse = z.infer<typeof createOrderResponseSchema>;
export type TrackedOrder = z.infer<typeof trackedOrderSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type Package = z.infer<typeof packageSchema>;
export type ServicesResponse = z.infer<typeof servicesResponseSchema>;
export type TravelZone = z.infer<typeof travelZoneSchema>;
export type Slot = z.infer<typeof slotSchema>;
export type Booking = z.infer<typeof bookingSchema>;
export type CreateBookingResponse = z.infer<typeof createBookingResponseSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type PublicSettings = z.infer<typeof publicSettingsSchema>;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type BookingStatus = (typeof BOOKING_STATUSES)[number];