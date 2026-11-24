import { Link } from "react-router-dom";
import { formatDuration } from "../../features/booking/serviceUtils";
import { naira } from "../../lib/format";
import type { Service } from "../../shared";
import { buttonClasses } from "../ui/buttonClasses";

export function ServiceRow({ service }: { service: Service }) {
  return (
    <li className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b border-sand py-5">
      <div className="min-w-0 max-w-prose flex-1">
        <h3 className="text-xl">{service.name}</h3>
        {service.description && <p className="mt-1">{service.description}</p>}
        <p className="mt-1 text-sm">
          {formatDuration(service.durationMin)}. {service.homeEligible ? "At the salon or at your place." : "At the salon only."}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <p className="font-display text-xl text-gold-deep">{naira(service.priceKobo)}</p>
        {/* The visible word "Book" is inside the longer spoken label, as accessibility rules ask */}
        <Link to={`/book?service=${service.id}`} aria-label={`Book ${service.name}`} className={buttonClasses({ variant: "secondary" })}>
          Book
        </Link>
      </div>
    </li>
  );
}