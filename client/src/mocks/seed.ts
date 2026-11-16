import type { DeliveryZone, Package, Product, PublicSettings, Review, Service, TravelZone } from "../shared";
import { lagosDate, type WeeklyHours } from "./slots";

// Stable, valid UUIDs, so an item keeps its id after a refresh.
// group: 1 product, 2 variant, 3 delivery zone, 4 service, 5 package, 6 travel zone, 7 review
export function seedId(group: number, n: number): string {
  return `${group.toString(16).padStart(8, "0")}-0000-4000-8000-${n.toString(16).padStart(12, "0")}`;
}

type VariantSpec = { lengthIn?: number; color?: string; density?: string; size?: string; naira: number; stock: number };
type ProductBase = Pick<Product, "slug" | "name" | "category" | "texture" | "description"> & { isActive?: boolean };

function makeProduct(n: number, base: ProductBase, specs: VariantSpec[]): Product {
  const id = seedId(1, n);
  return {
    id,
    media: [],
    ...base,
    isActive: base.isActive ?? true,
    variants: specs.map((s, i) => ({
      id: seedId(2, n * 100 + i),
      productId: id,
      sku: `VSS-${n}-${i + 1}`,
      lengthIn: s.lengthIn ?? null,
      color: s.color ?? null,
      density: s.density ?? null,
      size: s.size ?? null,
      priceKobo: s.naira * 100, // naira to kobo, once, here
      stock: s.stock,
      isActive: true,
    })),
  };
}

const black = "Natural black";

function products(): Product[] {
  return [
    makeProduct(1, { slug: "body-wave-bundle", name: "Body wave bundle", category: "bundles", texture: "Body wave",
      description: "A soft, bouncy wave. Sold per bundle." }, [
      { lengthIn: 12, color: black, naira: 38000, stock: 8 },
      { lengthIn: 16, color: black, naira: 45000, stock: 6 },
      { lengthIn: 20, color: black, naira: 55000, stock: 3 },
      { lengthIn: 24, color: black, naira: 68000, stock: 0 }, // sold-out variant
    ]),
    makeProduct(2, { slug: "straight-bone-bundle", name: "Straight bone bundle", category: "bundles", texture: "Straight",
      description: "Smooth and flat, easy to colour and style. Sold per bundle." }, [
      { lengthIn: 14, color: black, naira: 40000, stock: 10 },
      { lengthIn: 18, color: black, naira: 48000, stock: 5 },
      { lengthIn: 22, color: black, naira: 60000, stock: 2 },
    ]),
    makeProduct(3, { slug: "kinky-curly-bundle", name: "Kinky curly bundle", category: "bundles", texture: "Kinky curly",
      description: "Tight curls that blend with natural hair. Sold per bundle." }, [
      { lengthIn: 12, color: black, naira: 36000, stock: 4 },
      { lengthIn: 16, color: black, naira: 44000, stock: 4 },
      { lengthIn: 20, color: black, naira: 52000, stock: 4 },
    ]),
    makeProduct(4, { slug: "hd-lace-frontal-13x4", name: "HD lace frontal 13x4", category: "frontals_closures", texture: "Straight",
      description: "Thin, melt-into-skin lace with a wide ear-to-ear parting space." }, [
      { lengthIn: 14, size: "13x4", naira: 55000, stock: 5 },
      { lengthIn: 16, size: "13x4", naira: 62000, stock: 5 },
      { lengthIn: 18, size: "13x4", naira: 70000, stock: 5 },
    ]),
    makeProduct(5, { slug: "hd-lace-closure-5x5", name: "HD lace closure 5x5", category: "frontals_closures", texture: "Body wave",
      description: "A square closure for a neat middle or side parting." }, [
      { lengthIn: 12, size: "5x5", naira: 35000, stock: 6 },
      { lengthIn: 14, size: "5x5", naira: 40000, stock: 6 },
      { lengthIn: 16, size: "5x5", naira: 46000, stock: 0 },
    ]),
    makeProduct(6, { slug: "transparent-lace-frontal-13x6", name: "Transparent lace frontal 13x6 with a deep wave pattern", category: "frontals_closures",
      texture: "Deep wave", description: "Extra-deep lace for a natural hairline. The name is long on purpose, to test card layouts." }, [
      { lengthIn: 16, size: "13x6", naira: 72000, stock: 3 },
      { lengthIn: 18, size: "13x6", naira: 80000, stock: 2 },
    ]),
    makeProduct(7, { slug: "glueless-bob-wig", name: "Glueless bob wig", category: "wigs", texture: "Straight",
      description: "Put it on and go. Adjustable cap, no glue needed." }, [
      { lengthIn: 10, color: black, density: "180%", naira: 95000, stock: 3 },
      { lengthIn: 12, color: black, density: "180%", naira: 105000, stock: 2 },
      { lengthIn: 14, color: black, density: "180%", naira: 118000, stock: 2 },
    ]),
    makeProduct(8, { slug: "body-wave-lace-wig", name: "Body wave lace wig", category: "wigs", texture: "Body wave",
      description: "Full, long waves on a pre-plucked lace cap." }, [
      { lengthIn: 22, color: black, density: "200%", naira: 210000, stock: 2 },
      { lengthIn: 26, color: black, density: "200%", naira: 260000, stock: 1 },
      { lengthIn: 26, color: "Honey blonde", density: "200%", naira: 280000, stock: 1 }, // one left: good for stock tests
    ]),
    makeProduct(9, { slug: "burgundy-straight-wig", name: "Burgundy straight wig", category: "wigs", texture: "Straight",
      description: "A deep wine colour, already dyed." }, [
      { lengthIn: 24, color: "Burgundy", density: "180%", naira: 185000, stock: 0 }, // whole product sold out
    ]),
    makeProduct(10, { slug: "tape-in-extensions", name: "Tape-in extensions", category: "extensions", texture: "Straight",
      description: "Flat tape wefts that lie close to the scalp. Pack of 20 pieces." }, [
      { lengthIn: 18, color: black, naira: 60000, stock: 6 },
      { lengthIn: 22, color: black, naira: 72000, stock: 4 },
      { lengthIn: 18, color: "Dark brown", naira: 60000, stock: 3 },
    ]),
    makeProduct(11, { slug: "clip-in-extensions", name: "Clip-in extensions", category: "extensions", texture: "Straight",
      description: "Add length and fullness in minutes, then take them out at night." }, [
      { lengthIn: 16, color: "Dark brown", naira: 48000, stock: 7 },
      { lengthIn: 20, color: "Dark brown", naira: 58000, stock: 4 },
    ]),
    makeProduct(12, { slug: "silk-shine-hair-oil", name: "Silk shine hair oil", category: "hair_care", texture: null,
      description: "A light oil for shine and for sealing in moisture." }, [
      { size: "100ml", naira: 8500, stock: 25 },
      { size: "250ml", naira: 17500, stock: 12 },
    ]),
    // Hidden from the shop. Proves that inactive products never show
    makeProduct(13, { slug: "retired-lace-wig", name: "Retired lace wig", category: "wigs", texture: "Straight",
      description: "No longer sold.", isActive: false }, [
      { lengthIn: 20, color: black, density: "180%", naira: 150000, stock: 5 },
    ]),
  ];
}

// Every state plus FCT. Fees are sample numbers: [REPLACE] with the owner's real fees
const SOUTH_WEST = new Set(["Ogun", "Oyo", "Osun", "Ondo", "Ekiti"]);
const STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
  "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
  "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara",
];

function deliveryZones(): DeliveryZone[] {
  return STATES.map((state, i) => {
    if (state === "Lagos") return { id: seedId(3, i + 1), state, feeKobo: 250000, etaDaysMin: 1, etaDaysMax: 2 };
    if (SOUTH_WEST.has(state)) return { id: seedId(3, i + 1), state, feeKobo: 400000, etaDaysMin: 2, etaDaysMax: 3 };
    return { id: seedId(3, i + 1), state, feeKobo: 600000, etaDaysMin: 3, etaDaysMax: 6 };
  });
}

function services(): Service[] {
  const s = (n: number, name: string, category: Service["category"], durationMin: number, naira: number,
    homeEligible: boolean, isBridal: boolean, description: string): Service => ({
    id: seedId(4, n), name, category, description, durationMin, priceKobo: naira * 100, homeEligible, isBridal,
  });
  return [
    s(1, "Silk press", "hair", 90, 25000, false, false, "Wash, blow-dry and press for smooth, bouncy hair."),
    s(2, "Knotless braids", "hair", 240, 45000, true, false, "Neat, light braids that do not pull at the roots."),
    s(3, "Wig install and styling", "hair", 60, 15000, true, false, "We fit, cut and style your wig."),
    s(4, "Wig revamp", "hair", 120, 20000, false, false, "Wash, restore and restyle a wig you already own."),
    s(5, "Bridal makeup", "bridal", 120, 80000, true, true, "Makeup for the bride on the day, with touch-up time."),
    s(6, "Bridal hair styling", "bridal", 90, 60000, true, true, "Your wedding-day style, planned with you."),
    s(7, "Soft glam makeup", "makeup", 75, 30000, true, false, "A polished, natural look for events and photos."),
    s(8, "Manicure and pedicure", "nails_feet", 90, 18000, false, false, "Shaping, care and polish for hands and feet."),
  ];
}

function packages(): Package[] {
  return [
    { id: seedId(5, 1), name: "Bridal glam package", description: "Everything for the bride on the day.",
      includes: ["Bridal makeup", "Bridal hair styling", "Touch-up kit"], durationMin: 240, priceKobo: 18000000,
      homeEligible: true, isBridal: true },
    { id: seedId(5, 2), name: "Bridesmaid package", description: "Makeup and styling for up to four bridesmaids.",
      includes: ["Soft glam makeup", "Hair styling"], durationMin: 180, priceKobo: 12000000,
      homeEligible: true, isBridal: true },
  ];
}

function travelZones(): TravelZone[] {
  return [
    { id: seedId(6, 1), name: "Lagos Island", areas: ["Victoria Island", "Ikoyi", "Lagos Island"], feeKobo: 800000, travelBufferMin: 60 },
    { id: seedId(6, 2), name: "Lekki and Ajah", areas: ["Lekki Phase 1", "Chevron", "Ajah", "Sangotedo"], feeKobo: 1000000, travelBufferMin: 90 },
    { id: seedId(6, 3), name: "Mainland", areas: ["Ikeja", "Yaba", "Surulere", "Maryland"], feeKobo: 700000, travelBufferMin: 60 },
  ];
}

// Sample text for layout work only. Real reviews come from the owner in the admin
function reviews(): Review[] {
  const r = (n: number, author: string, rating: number, body: string, createdAt: string): Review =>
    ({ id: seedId(7, n), author, rating, body, avatarUrl: null, createdAt });
  return [
    r(1, "Sample customer A", 5, "My frontal arrived two days after I ordered and the lace was really thin.", "2026-09-12T10:00:00+01:00"),
    r(2, "Sample customer B", 5, "She finished my bridal makeup on time and it lasted the whole day.", "2026-08-30T15:30:00+01:00"),
    r(3, "Sample customer C", 4, "Good quality bundles. The 24 inch was sold out, so I took 20 and it was still lovely.", "2026-08-02T09:15:00+01:00"),
    r(4, "Sample customer D", 5, "Booking was easy and she came to my house on time.", "2026-07-19T18:00:00+01:00"),
  ];
}

const settings: PublicSettings = {
  business: { name: "VSS Hair", city: "Benin City", address: "Ekae Junction Off Sapele Road Benin City", hoursText: "Monday to Saturday, 8:00 to 18:00" },
  awayMode: false,
  deposit: { bridalPercent: 50 }, // [REPLACE] owner decides
  cancellationPolicy: {
    freeCancelHours: 48,
    text: "You can cancel or reschedule free of charge up to 48 hours before your appointment. day Later changes may lose your deposit.",
  },
  slotMinutes: 30,
  minNoticeHoursHome: 24,
  orderHoldHours: 24,
  bookingHoldHours: 24,
  bridalHoldHours: 48,
};

// Tuesday to Saturday, 9:00 to 18:00. [REPLACE] with the owner's hours
const weeklyHours: WeeklyHours[] = [2, 3, 4, 5, 6].map((weekday) => ({ weekday, start: "09:00", end: "18:00" }));

export function createSeed(now: Date) {
  const day = 24 * 3_600_000;
  return {
    products: products(),
    deliveryZones: deliveryZones(),
    services: services(),
    packages: packages(),
    travelZones: travelZones(),
    reviews: reviews(),
    settings: structuredClone(settings),
    availability: {
      weeklyHours: structuredClone(weeklyHours),
      dayOffs: [lagosDate(now.getTime() + 10 * day)], // a day off 10 days from now, so you can see it blocked
      bridalBlocks: [lagosDate(now.getTime() + 30 * day)], // a bridal date already taken
    },
  };
}