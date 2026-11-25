import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { ADMIN_NAV } from "../../features/admin/nav";
import { useNoIndex } from "../../lib/useNoIndex";

// At least 44px tall. The current section has a gold bar AND bold text, so it does not depend on colour
const rowBase =
  "flex min-h-[2.75rem] items-center border-l-4 px-4 hover:bg-cocoa focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold-light";
function rowClass({ isActive }: { isActive: boolean }) {
  return `${rowBase} ${isActive ? "border-gold-light bg-cocoa font-medium" : "border-transparent"}`;
}

export function AdminLayout() {
  const { signOut } = useAdminAuth();
  const { pathname } = useLocation();
  useNoIndex(); // admin pages must not appear in search results

  const [menuOpen, setMenuOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const previousPath = useRef(pathname);

  // Only when the address CHANGES: close the menu and move focus to the page content
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    setMenuOpen(false);
    mainRef.current?.focus();
  }, [pathname]);

  return (
    <div className="min-h-screen bg-ivory lg:flex">
      {/* First stop for keyboard users: jump past the menu */}
      <button
        type="button"
        onClick={() => mainRef.current?.focus()}
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-10 focus:bg-ivory focus:px-4 focus:py-2 focus:text-espresso"
      >
        Skip to content
      </button>

      <aside className="bg-espresso text-ivory lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="font-display text-xl text-gold-light">VSS Hair admin</p>
          {/* The word "Menu", not only an icon. Phones only */}
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="admin-nav"
            onClick={() => setMenuOpen((open) => !open)}
            className="min-h-[2.75rem] border-2 border-gold-light px-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-light lg:hidden"
          >
            {menuOpen ? "Close menu" : "Menu"}
          </button>
        </div>

        {/* Hidden on a phone until the menu is open. Always shown from lg up */}
        <nav id="admin-nav" aria-label="Admin" className={`${menuOpen ? "block" : "hidden"} pb-4 lg:block`}>
          <ul>
            <li>
              <NavLink to="/admin" end className={rowClass}>
                Overview
              </NavLink>
            </li>
            {ADMIN_NAV.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={rowClass}>
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li className="mt-4 px-4">
              <button
                type="button"
                onClick={signOut}
                className="min-h-[2.75rem] w-full border-2 border-gold-light px-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-light"
              >
                Log out
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <main id="admin-main" ref={mainRef} tabIndex={-1} className="flex-1 px-4 py-8 outline-none lg:px-10">
        <Outlet />
      </main>
    </div>
  );
}