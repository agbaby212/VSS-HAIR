import { Link } from "react-router-dom";
import { whatsappChatUrl } from "../../lib/whatsapp";
import { LogoBadge } from "./LogoBadge";
import { helpLinks, mainLinks } from "./navLinks";

export function Footer() {
  return (
    <footer className="on-dark mt-16 bg-espresso text-ivory">
      <div className="foil-divider" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
        <div>
          <LogoBadge className="h-16" />
          <p className="mt-4 max-w-sm">
            Hair, bridal and beauty in Benin City. Choose your order here, then send it to us on
            WhatsApp.
          </p>
          <p className="mt-3 max-w-sm text-sm text-sand">
            You pay by bank transfer straight to the owner, after she shares her account details in
            the chat. This site never takes payment.
          </p>
        </div>

        <nav aria-label="Explore">
          <h2 className="text-xl text-gold-light">Explore</h2>
          <ul className="mt-3 space-y-1">
            {mainLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="inline-block py-1 hover:text-gold-light">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Help">
          <h2 className="text-xl text-gold-light">Help</h2>
          <ul className="mt-3 space-y-1">
            {helpLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="inline-block py-1 hover:text-gold-light">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-xl text-gold-light">Visit and contact</h2>
          <p className="mt-3">Ekea Junction Off Sapele Road Benin City</p>
          <p className="mt-1">Open 8am-6pm</p>
          <a
            href={whatsappChatUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block py-1 text-gold-light underline underline-offset-4"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
      <p className="border-t border-cocoa px-4 py-4 text-center text-sm text-sand">
        © {new Date().getFullYear()} VSS Hair
      </p>
    </footer>
  );
}