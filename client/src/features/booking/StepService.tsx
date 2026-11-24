import type { Dispatch, ReactNode } from "react";
import { RadioCard } from "../../components/ui/RadioCard";
import { naira } from "../../lib/format";
import type { Package, Service, ServicesResponse } from "../../shared";
import type { BookingAction, BookingDraft, ItemKind } from "./bookingDraft";
import { formatDuration, splitServices } from "./serviceUtils";

type Props = { data: ServicesResponse; draft: BookingDraft; dispatch: Dispatch<BookingAction> };

function Option({ kind, item, draft, dispatch }: { kind: ItemKind; item: Service | Package; draft: BookingDraft; dispatch: Dispatch<BookingAction> }) {
  return (
    <RadioCard
      name="item"
      value={`${kind}:${item.id}`}
      checked={draft.kind === kind && draft.itemId === item.id}
      onChange={() => dispatch({ type: "chooseItem", kind, id: item.id, homeEligible: item.homeEligible })}
    >
      <span className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <span className="min-w-0 flex-1">
          <span className="block font-medium">{item.name}</span>
          {item.description && <span className="block">{item.description}</span>}
          <span className="block text-sm">
            {formatDuration(item.durationMin)}. {item.homeEligible ? "At the salon or at your place." : "At the salon only."}
          </span>
        </span>
        <span className="font-display text-xl text-gold-deep">{naira(item.priceKobo)}</span>
      </span>
    </RadioCard>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="text-xl">{title}</h3>
      <div className="mt-2 space-y-2">{children}</div>
    </div>
  );
}

export function StepService({ data, draft, dispatch }: Props) {
  const { groups, bridal } = splitServices(data.services);
  return (
    <fieldset className="space-y-6">
      <legend className="sr-only">Choose a service or a package</legend>
      {groups.map((group) => (
        <Group key={group.category} title={group.label}>
          {group.items.map((item) => (
            <Option key={item.id} kind="service" item={item} draft={draft} dispatch={dispatch} />
          ))}
        </Group>
      ))}
      {data.packages.length > 0 && (
        <Group title="Bridal packages">
          {data.packages.map((item) => (
            <Option key={item.id} kind="package" item={item} draft={draft} dispatch={dispatch} />
          ))}
        </Group>
      )}
      {bridal.length > 0 && (
        <Group title="Bridal services">
          {bridal.map((item) => (
            <Option key={item.id} kind="service" item={item} draft={draft} dispatch={dispatch} />
          ))}
        </Group>
      )}
    </fieldset>
  );
}