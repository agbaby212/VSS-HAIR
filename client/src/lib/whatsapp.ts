// A plain chat link, used by the footer and the mobile bar.
// Order and booking messages are NOT built here: the server builds those (Section 3).
export function whatsappChatUrl(text?: string): string {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER; // digits only, like 234XXXXXXXXXX
  const base = `https://wa.me/${number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
// The order link comes from the server. We only open it if it really is a WhatsApp chat link
export function isWhatsappUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.port) return false;

    const validPhone = (phone: string | null) => phone !== null && /^\d{7,15}$/.test(phone);
    if (parsed.hostname === "wa.me") return /^\/\d{7,15}$/.test(parsed.pathname);
    if (parsed.hostname === "api.whatsapp.com") {
      return parsed.pathname === "/send" && parsed.searchParams.getAll("phone").length === 1 && validPhone(parsed.searchParams.get("phone"));
    }
    return false;
  } catch {
    return false;
  }
}
// The server puts the order message inside the link (?text=...). This reads it back out,
// so the page shows exactly what the server prepared
export function messageFromWhatsappUrl(url: string): string | null {
  try {
    return new URL(url).searchParams.get("text");
  } catch {
    return null;
  }
}