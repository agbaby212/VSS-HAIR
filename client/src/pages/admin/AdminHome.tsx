import { Link } from "react-router-dom";
import { ADMIN_NAV } from "../../features/admin/nav";
import { useDocumentTitle } from "../../lib/useDocumentTitle";

export default function AdminHome() {
  useDocumentTitle("Overview");
  return (
    <div>
      <h1 className="text-3xl">Welcome</h1>
      <p className="mt-2 max-w-prose">Choose what you want to do.</p>

      {/* A plain list with dividers, not a grid of identical cards. Whole row is the tap target */}
      <ul className="mt-6 max-w-2xl divide-y divide-gold border-y border-gold">
        {ADMIN_NAV.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className="block min-h-[2.75rem] py-4 hover:bg-sand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
            >
              <span className="block text-xl font-medium">{item.label}</span>
              <span className="block">{item.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}