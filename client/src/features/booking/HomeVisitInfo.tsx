import { ErrorNotice } from "../../components/ui/ErrorNotice";
import { naira } from "../../lib/format";
import { whatsappChatUrl } from "../../lib/whatsapp";
import { usePublicSettings } from "../shop/queries";
import { useTravelZones } from "./queries";

export function HomeVisitInfo() {
  const zones = useTravelZones();
  const settings = usePublicSettings();
  const notice = settings.data?.minNoticeHoursHome;

  return (
    <div>
      <p className="max-w-prose">
        Some services can be done at your place.
        {notice ? ` Please book at least ${notice} hours ahead.` : ""} We set aside travel time before and after a home visit, so the
        time you book is only for you.
      </p>

      {zones.isError && (
        <div className="mt-4">
          <ErrorNotice error={zones.error} onRetry={() => void zones.refetch()} title="We could not load the home visit areas" />
        </div>
      )}

      {zones.data && zones.data.length > 0 && (
        // The wrapper scrolls on its own, so a wide table never makes the whole page scroll sideways
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left">
            <caption className="sr-only">Home visit areas and travel fees</caption>
            <thead>
              <tr className="border-b border-gold">
                <th scope="col" className="py-2 pr-4 font-medium">Area</th>
                <th scope="col" className="py-2 pr-4 font-medium">Places</th>
                <th scope="col" className="py-2 text-right font-medium">Travel fee</th>
              </tr>
            </thead>
            <tbody>
              {zones.data.map((zone) => (
                <tr key={zone.id} className="border-b border-sand align-top">
                  <th scope="row" className="py-3 pr-4 font-medium">{zone.name}</th>
                  <td className="py-3 pr-4">{zone.areas.join(", ")}</td>
                  <td className="py-3 text-right font-display text-lg text-gold-deep">{naira(zone.feeKobo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 max-w-prose">
        Is your area not listed? Book at the salon, or{" "}
        <a href={whatsappChatUrl()} target="_blank" rel="noopener noreferrer" className="text-gold-deep underline underline-offset-4">
          ask us on WhatsApp
        </a>
        .
      </p>
    </div>
  );
}