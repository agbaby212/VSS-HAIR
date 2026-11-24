import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { buttonClasses } from "../ui/buttonClasses";
import { LogoBadge } from "./LogoBadge";
import { helpLinks, mainLinks } from "./navLinks";
import { useCart } from "../../context/useCart";

// NavLink knows the current page, so we can mark it (it also sets aria-current for screen readers)
function navClass({ isActive }: { isActive: boolean }): string {
  return isActive
    ? "px-1 py-2 text-gold-light underline decoration-gold-light decoration-2 underline-offset-8"
    : "px-1 py-2 text-ivory hover:text-gold-light";
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { count } = useCart();
  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className="on-dark bg-espresso text-ivory"
      onKeyDown={(event) => {
        if (event.key === "Escape") closeMenu();
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <LogoBadge />

        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {mainLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={navClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <NavLink to="/track" className={(state) => `${navClass(state)} hidden xl:inline`}>
            Track an order
          </NavLink>
          <NavLink
            to="/cart"
            className={navClass}
            aria-label={count > 0 ? `Bag, ${count} ${count === 1 ? "item" : "items"}` : "Bag"}
          >
            Bag{count > 0 ? ` (${count})` : ""}
          </NavLink>
          <Link
            to="/book"
            className={`${buttonClasses({ variant: "gold" })} hidden lg:inline-flex`}
          >
            Book appointment
          </Link>
          <button
            type="button"
            className="min-h-[2.75rem] rounded-full border-2 border-gold px-4 text-ivory lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      <div className="foil-divider" />

      {menuOpen && (
        <nav id="mobile-menu" aria-label="Menu" className="border-b border-cocoa lg:hidden">
          <ul className="mx-auto max-w-6xl px-4 py-2">
            {[...mainLinks, ...helpLinks].map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `block min-h-[2.75rem] py-3 ${isActive ? "text-gold-light" : "text-ivory"}`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}