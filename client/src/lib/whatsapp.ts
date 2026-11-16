// A plain chat link, used by the footer and the mobile bar.
// Order and booking messages are NOT built here: the server builds those (Section 3).
export function whatsappChatUrl(text?: string): string {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER; // digits only, like 234XXXXXXXXXX
  const base = `https://wa.me/${number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}