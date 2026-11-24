// The policy is free text from the owner's settings. We accept a plain string or { text: "..." }.
// Blank lines separate paragraphs. Returns null when there is nothing to show
export function readPolicy(value: unknown): string[] | null {
  let text: string | null = null;
  if (typeof value === "string") text = value;
  else if (typeof value === "object" && value !== null && typeof (value as { text?: unknown }).text === "string") {
    text = (value as { text: string }).text;
  }
  if (text === null) return null;

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph !== "");
  return paragraphs.length > 0 ? paragraphs : null;
}