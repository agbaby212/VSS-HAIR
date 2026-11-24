export const MAX_INSPIRATION_BYTES = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validateInspirationFile(file: Pick<File, "type" | "size">): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) return "Choose a JPG, PNG or WebP photo.";
  if (file.size === 0) return "The selected photo is empty.";
  if (file.size > MAX_INSPIRATION_BYTES) return "The photo is too large. The limit is 5 MB.";
  return null;
}
