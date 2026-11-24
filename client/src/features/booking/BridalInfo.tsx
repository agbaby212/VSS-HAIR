import { usePublicSettings } from "../shop/queries";

// Every number comes from the public settings. If they are still loading, the sentences read fine without them
export function BridalInfo() {
  const { data } = usePublicSettings();
  const deposit = data ? `${data.deposit.bridalPercent}% deposit` : "deposit";
  const hold = data ? `${data.bridalHoldHours} hours` : "a short time";

  return (
    <div className="mt-8">
      <h3 className="text-2xl">How bridal booking works</h3>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        <li>Choose a package or service and the time you want.</li>
        <li>Tell us your event date, venue, call time and party size, and if you want a trial session.</li>
        <li>
          We hold your date for {hold} while you pay the {deposit}. You pay by bank transfer to the owner, after she shares her account
          details on WhatsApp.
        </li>
        <li>Once she confirms your deposit, nobody else can book that date.</li>
      </ol>
      <p className="mt-3 text-sm">This site never takes payment.</p>
      {data && <p className="mt-4 max-w-prose">{data.cancellationPolicy.text}</p>}
    </div>
  );
}