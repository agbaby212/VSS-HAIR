import type { Dispatch } from "react";
import { ErrorNotice } from "../../components/ui/ErrorNotice";
import { RadioCard } from "../../components/ui/RadioCard";
import { Select } from "../../components/ui/Select";
import { naira } from "../../lib/format";
import { whatsappChatUrl } from "../../lib/whatsapp";
import { usePublicSettings } from "../shop/queries";
import type { Bookable, BookingAction, BookingDraft } from "./bookingDraft";
import { useTravelZones } from "./queries";

type Props = { item: Bookable; draft: BookingDraft; dispatch: Dispatch<BookingAction> };

export function StepLocation({ item, draft, dispatch }: Props) {
  const zones = useTravelZones();
  const settings = usePublicSettings();
  const zone = zones.data?.find((candidate) => candidate.id === draft.travelZoneId);
  const notice = settings.data?.minNoticeHoursHome;

  return (
    <div className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="sr-only">Where do you want it?</legend>
        <RadioCard name="location" value="salon" checked={draft.locationType === "salon"} onChange={() => dispatch({ type: "chooseLocation", locationType: "salon" })}>
          <span className="block font-medium">At the salon</span>
          <span className="block text-sm">{settings.data?.business.address ?? "..."}</span>
        </RadioCard>
        <RadioCard
          name="location"
          value="home"
          checked={draft.locationType === "home"}
          disabled={!item.homeEligible}
          onChange={() => dispatch({ type: "chooseLocation", locationType: "home" })}
        >
          <span className="block font-medium">At my place</span>
          <span className="block text-sm">
            {item.homeEligible
              ? `We come to you. A travel fee applies.${notice ? ` Book at least ${notice} hours ahead.` : ""}`
              : "This service is only done at the salon."}
          </span>
        </RadioCard>
      </fieldset>

      {draft.locationType === "home" && (
        <div>
          {zones.isError ? (
            <ErrorNotice error={zones.error} onRetry={() => void zones.refetch()} title="We could not load the home visit areas" />
          ) : (
            <Select
              label="Your area"
              anyLabel={zones.isPending ? "Loading areas" : "Choose your area"}
              value={draft.travelZoneId ?? ""}
              onChange={(value) => dispatch({ type: "chooseZone", travelZoneId: value === "" ? null : value })}
              options={(zones.data ?? []).map((item) => ({ value: item.id, label: `${item.name} (travel fee ${naira(item.feeKobo)})` }))}
            />
          )}

          {/* role="status": the message is read aloud when the area changes */}
          <div role="status" className="mt-3 max-w-prose">
            {zone ? (
              <p>
                {zone.name} covers {zone.areas.join(", ")}. The travel fee is <strong>{naira(zone.feeKobo)}</strong>. We set aside travel time
                before and after your visit, so the time you book is only for you.
              </p>
            ) : (
              zones.data && (
                <p>
                  We travel to: {zones.data.map((z) => `${z.name} (${z.areas.join(", ")})`).join("; ")}.
                </p>
              )
            )}
          </div>

          <p className="mt-3 max-w-prose">
            Is your area not listed? Book at the salon, or{" "}
            <a href={whatsappChatUrl()} target="_blank" rel="noopener noreferrer" className="text-gold-deep underline underline-offset-4">
              ask us on WhatsApp
            </a>
            . You give your full address in the next step.
          </p>
        </div>
      )}
    </div>
  );
}