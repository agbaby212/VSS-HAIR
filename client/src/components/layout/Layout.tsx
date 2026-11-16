import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { MobileBar } from "./MobileBar";

export function Layout() {
  return (
    // The bottom padding keeps the fixed mobile bar from covering the footer
    <div className="flex min-h-screen flex-col pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      {/* First stop for keyboard users: jump past the header */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-ivory focus:px-4 focus:py-2 focus:text-espresso"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
      <Footer />
      <MobileBar />
    </div>
  );
}