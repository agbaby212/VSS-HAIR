export type AdminNavItem = {
  to: string;
  label: string;
  description: string; // plain words for the owner, shown on the Overview page
  builtIn: string; // the task that builds the real page (used by the temporary placeholder)
};

// Ordered by daily use: what the owner checks every day first, set-up pages after
export const ADMIN_NAV: readonly AdminNavItem[] = [
  { to: "/admin/orders", label: "Orders", description: "See orders and confirm the payments you have received.", builtIn: "FE-T12" },
  { to: "/admin/bookings", label: "Bookings", description: "See appointments, confirm deposits, move or cancel them.", builtIn: "FE-T12" },
  { to: "/admin/inbox", label: "Inbox", description: "WhatsApp chats the bot could not finish, and messages that did not send.", builtIn: "FE-T15" },
  { to: "/admin/products", label: "Products", description: "Hair products, photos, prices and stock.", builtIn: "FE-T13" },
  { to: "/admin/services", label: "Services", description: "Services and packages, how long they take and what they cost.", builtIn: "FE-T13" },
  { to: "/admin/availability", label: "Availability", description: "Opening hours, days off and your away switch.", builtIn: "FE-T14" },
  { to: "/admin/fees", label: "Fees", description: "Delivery fees for each state and travel fees for home visits.", builtIn: "FE-T14" },
  { to: "/admin/settings", label: "Settings", description: "Business details, deposit rules, the cancellation policy and bot messages.", builtIn: "FE-T14" },
];