import { useState } from "react";
import { ErrorNotice } from "../../components/ui/ErrorNotice";
import { Select } from "../../components/ui/Select";
import { naira } from "../../lib/format";
import { deliveryEtaText } from "../checkout/orderPayload";
import { useDeliveryZones } from "./queries";

export function StateFeeChecker() {
  const zones = useDeliveryZones();
  const [state, setState] = useState("");

  if (zones.isError) {
    return <ErrorNotice error={zones.error} onRetry={() => void zones.refetch()} title="We could not load the delivery fees" />;
  }

  const list = [...(zones.data ?? [])].sort((a, b) => a.state.localeCompare(b.state));
  const zone = list.find((candidate) => candidate.state === state);

  return (
    <div>
      <div className="max-w-sm">
        <Select
          label="Check delivery to your state"
          anyLabel={zones.isPending ? "Loading states" : "Choose your state"}
          value={state}
          onChange={setState}
          options={list.map((item) => ({ value: item.state, label: item.state }))}
        />
      </div>
      {/* role="status": the answer is read aloud when the state changes */}
      <p role="status" className="mt-3 min-h-[1.5rem] text-lg">
        {zone && (
          <>
            Delivery to {zone.state}: <strong>{naira(zone.feeKobo)}</strong>. Estimated delivery time: {deliveryEtaText(zone)}.
          </>
        )}
      </p>

      {list.length > 0 && (
        <details className="mt-4">
          <summary className="inline-flex min-h-[2.75rem] cursor-pointer items-center text-gold-deep underline underline-offset-4">
            See every state
          </summary>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[24rem] text-left">
              <caption className="sr-only">Delivery fee and estimated time for every state</caption>
              <thead>
                <tr className="border-b border-gold">
                  <th scope="col" className="py-2 pr-4 font-medium">State</th>
                  <th scope="col" className="py-2 pr-4 font-medium">Delivery fee</th>
                  <th scope="col" className="py-2 font-medium">Estimated time</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item.id} className="border-b border-sand">
                    <th scope="row" className="py-2 pr-4 font-medium">{item.state}</th>
                    <td className="py-2 pr-4">{naira(item.feeKobo)}</td>
                    <td className="py-2">{deliveryEtaText(item)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}