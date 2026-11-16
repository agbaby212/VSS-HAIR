import { NavLink } from "react-router-dom";
import { whatsappChatUrl } from "../../lib/whatsapp";

// Same height on every item (3.5rem = 56px) so the bar is easy to hit with a thumb
const item = "flex min-h-[3.5rem] flex-1 items-center justify-center font-medium";

export function MobileBar() {
  return (
    <nav
      aria-label="Quick actions"
      className="on-dark fixed inset-x-0 bottom-0 z-40 border-t border-gold bg-espresso pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="flex">
        <li className="flex flex-1">
          <NavLink
            to="/shop"
            className={({ isActive }) => `${item} ${isActive ? "text-gold-light" : "text-ivory"}`}
          >
            Shop
          </NavLink>
        </li>
        <li className="flex flex-1">
          <NavLink to="/book" className={`${item} bg-gold text-espresso`}>
            Book
          </NavLink>
        </li>
        <li className="flex flex-1">
          <a
            href={whatsappChatUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className={`${item} text-ivory`}
          >
            WhatsApp
          </a>
        </li>
      </ul>
    </nav>
  );
}