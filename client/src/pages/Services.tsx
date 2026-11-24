import { PackagePanel } from "../components/booking/PackagePanel";
import { ServiceRow } from "../components/booking/ServiceRow";
import { ErrorNotice } from "../components/ui/ErrorNotice";
import { BridalInfo } from "../features/booking/BridalInfo";
import { HomeVisitInfo } from "../features/booking/HomeVisitInfo";
import { useServices } from "../features/booking/queries";
import { splitServices } from "../features/booking/serviceUtils";
import { useScrollToHash } from "../lib/useScrollToHash";
import { whatsappChatUrl } from "../lib/whatsapp";

export default function Services() {
  const query = useServices();
  useScrollToHash(query.isSuccess); // /services#bridal works from other pages

  const { groups, bridal } = query.data ? splitServices(query.data.services) : { groups: [], bridal: [] };
  const packages = query.data?.packages ?? [];
  const hasBridal = bridal.length > 0 || packages.length > 0;
  const empty = query.isSuccess && groups.length === 0 && !hasBridal;

  const jumps = [
    ...groups.map((group) => ({ id: group.category, label: group.label })),
    ...(hasBridal ? [{ id: "bridal", label: "Bridal" }] : []),
    { id: "home-visits", label: "Home visits" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl">Services</h1>
      <p className="mt-2 max-w-prose text-lg">
        Choose a service, pick a time, then send your booking to the owner on WhatsApp. You can come to the salon, or for some services we
        come to you.
      </p>

      {query.isSuccess && (
        <nav aria-label="On this page" className="mt-5">
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {jumps.map((jump) => (
              <li key={jump.id}>
                <a href={`#${jump.id}`} className="inline-flex min-h-[2.75rem] items-center text-gold-deep underline underline-offset-4">
                  {jump.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {query.isPending && (
        <div aria-busy="true" className="mt-8 space-y-3">
          <p className="sr-only" role="status">Loading services</p>
          {[0, 1, 2, 3].map((n) => (
            <div key={n} aria-hidden="true" className="h-20 animate-pulse bg-sand" />
          ))}
        </div>
      )}

      {query.isError && (
        <div className="mt-8">
          <ErrorNotice error={query.error} onRetry={() => void query.refetch()} title="We could not load the services" />
        </div>
      )}

      {empty && (
        <p className="mt-8 max-w-prose">
          We are adding our services. Message us on{" "}
          <a href={whatsappChatUrl()} target="_blank" rel="noopener noreferrer" className="text-gold-deep underline underline-offset-4">
            WhatsApp
          </a>{" "}
          to ask what we offer.
        </p>
      )}

      {groups.map((group) => (
        <section key={group.category} id={group.category} aria-labelledby={`${group.category}-title`} className="mt-12">
          <h2 id={`${group.category}-title`} className="text-3xl">{group.label}</h2>
          <ul className="mt-2 border-t border-sand">
            {group.items.map((item) => (
              <ServiceRow key={item.id} service={item} />
            ))}
          </ul>
        </section>
      ))}

      {hasBridal && (
        <section id="bridal" aria-labelledby="bridal-title" className="mt-14 bg-sand p-6 sm:p-10">
          <h2 id="bridal-title" className="text-3xl sm:text-4xl">Bridal</h2>
          <p className="mt-2 max-w-prose">Your wedding day, planned with you. Bridal bookings need a deposit to hold your date.</p>

          {packages.length > 0 && (
            <ul className="mt-6 grid gap-5 md:grid-cols-2">
              {packages.map((pack) => (
                <PackagePanel key={pack.id} pack={pack} />
              ))}
            </ul>
          )}

          {bridal.length > 0 && (
            <div className="mt-8">
              <h3 className="text-2xl">Bridal services on their own</h3>
              <ul className="mt-2 border-t border-gold">
                {bridal.map((item) => (
                  <ServiceRow key={item.id} service={item} />
                ))}
              </ul>
            </div>
          )}

          <BridalInfo />
        </section>
      )}

      <section id="home-visits" aria-labelledby="home-title" className="mt-14">
        <h2 id="home-title" className="text-3xl">Home visits</h2>
        <div className="mt-3">
          <HomeVisitInfo />
        </div>
      </section>
    </div>
  );
}