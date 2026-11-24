import { Link } from "react-router-dom";
import { formatDuration } from "../../features/booking/serviceUtils";
import { naira } from "../../lib/format";
import type { Package } from "../../shared";
import { buttonClasses } from "../ui/buttonClasses";

export function PackagePanel({ pack }: { pack: Package }) {
  return (
    <li className="flex flex-col bg-ivory p-6">
      <h3 className="text-2xl">{pack.name}</h3>
      {pack.description && <p className="mt-1">{pack.description}</p>}
      <ul className="mt-3 list-disc space-y-1 pl-5">
        {pack.includes.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-3 text-sm">
        {formatDuration(pack.durationMin)}. {pack.homeEligible ? "At the salon or at your place." : "At the salon only."}
      </p>
      <p className="mt-4 font-display text-3xl text-gold-deep">{naira(pack.priceKobo)}</p>
      <Link to={`/book?package=${pack.id}`} aria-label={`Book ${pack.name}`} className={`${buttonClasses()} mt-4 self-start`}>
        Book
      </Link>
    </li>
  );
}