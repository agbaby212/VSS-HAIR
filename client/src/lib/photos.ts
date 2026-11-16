import type { Product } from "../shared";

export type SitePhoto = { src?: string; alt: string; width: number; height: number };

const photo = (alt: string, size: number, src?: string): SitePhoto => ({ src, alt, width: size, height: size });

// To add a real photo: copy the file into client/public/photos/, then set src to "/photos/<file>".
// Then rewrite the alt text so it describes what the photo REALLY shows.
// Leave src empty and the sand placeholder shows instead.
export const photos = {
  hero: {
    main: photo("A client smiling in a long, wavy wig", 800 /* src: "/photos/hero-main.webp" */),
    detail: photo("A close-up of a smooth lace hairline", 600 /* src: "/photos/hero-detail.webp" */),
    bridal: photo("A bride with soft, natural makeup", 600 /* src: "/photos/hero-bridal.webp" */),
  },
  // Category circles sit next to a text label, so their alt is empty (the label already names the link).
  // A screen reader would otherwise say the same thing twice.
  categories: {
    bundles: photo("", 400),
    frontals_closures: photo("", 400),
    wigs: photo("", 400),
    extensions: photo("", 400),
    hair_care: photo("", 400),
  } satisfies Record<Product["category"], SitePhoto>,
  bridalBand: photo("A bride in her finished wedding look", 800),
} as const;