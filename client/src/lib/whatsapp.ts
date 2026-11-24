// A plain chat link, used by the footer and the mobile bar.
// Order and booking messages are NOT built here: the server builds those (Section 3).
export function whatsappChatUrl(text?: string): string {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER; // digits only, like 234XXXXXXXXXX
  const base = `https://wa.me/${number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
// The order link comes from the server. We only open it if it really is a WhatsApp chat link
export function isWhatsappUrl(url: string): boolean {
  return url.startsWith("https://wa.me/080790555526") || url.startsWith("https://api.whatsapp.com/send?phone=23480790555526");
}