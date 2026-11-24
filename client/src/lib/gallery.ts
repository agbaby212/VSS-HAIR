export const GALLERY_CATEGORIES = [
  { value: "before_after", label: "Before and after" },
  { value: "bridal", label: "Bridal looks" },
  { value: "braids", label: "Braids" },
  { value: "nails", label: "Nails" },
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number]["value"];

export type GalleryPhoto = { src?: string; alt: string };

// A "before and after" look has both photos. Every other look has just one
export type GalleryItem = {
  id: string;
  category: GalleryCategory;
  title: string;
  photo: GalleryPhoto; // for a before and after look, this is the AFTER
  before?: GalleryPhoto;
};

// Anything that is not one of ours (a mistyped address) becomes "show everything"
export function parseGalleryCategory(value: string | null): GalleryCategory | undefined {
  return GALLERY_CATEGORIES.find((category) => category.value === value)?.value;
}

export function filterGallery(items: GalleryItem[], category: GalleryCategory | undefined): GalleryItem[] {
  return category ? items.filter((item) => item.category === category) : items;
}

// To add a real photo: copy the file into client/public/photos/ and set src to "/photos/<file>".
// Then rewrite alt so it describes what the photo REALLY shows.
// Only use photos of clients who agreed to be shown (see the [REPLACE] list).
// Titles are placeholders that match the idea of each photo. Rename them to match the real photos.
function look(id: string, category: GalleryCategory, title: string, pair = false): GalleryItem {
  return {
    id,
    category,
    title,
    photo: { alt: pair ? `${title}, after` : title },
    ...(pair ? { before: { alt: `${title}, before` } } : {}),
  };
}

export const GALLERY_ITEMS: GalleryItem[] = [
  look("ba-silk-press", "before_after", "Silk press", true),
  look("ba-wig-install", "before_after", "Wig install", true),
  look("ba-knotless", "before_after", "Knotless braids", true),
  look("bridal-makeup", "bridal", "Bridal makeup"),
  look("bridal-hair", "bridal", "Bridal hair styling"),
  look("bridal-party", "bridal", "Bridesmaids"),
  look("braids-knotless", "braids", "Knotless braids"),
  look("braids-box", "braids", "Box braids"),
  look("braids-cornrows", "braids", "Cornrows"),
  look("nails-manicure", "nails", "Manicure"),
  look("nails-pedicure", "nails", "Pedicure"),
  look("nails-art", "nails", "Nail art"),
];