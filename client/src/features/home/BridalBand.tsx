import { Link } from "react-router-dom";
import { Photo } from "../../components/ui/Photo";
import { buttonClasses } from "../../components/ui/buttonClasses";
import { photos } from "../../lib/photos";
import { usePublicSettings } from "../shop/queries";

export function BridalBand() {
  const { data } = usePublicSettings();
  const deposit = data ? `${data.deposit.bridalPercent}% deposit` : "deposit";
  const hold = data ? `${data.bridalHoldHours} hours` : "a short time";

  return (
    <section aria-labelledby="bridal-title" className="on-dark mt-12 bg-espresso text-ivory">
      <div className="foil-divider" />
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-[1fr_auto]">
        <div>
          <h2 id="bridal-title" className="text-3xl sm:text-4xl">
            Bridal bookings
          </h2>
          <p className="mt-4 max-w-prose text-lg">
            Tell us your event date, venue, call time and party size. We hold your date for {hold} while you pay the{" "}
            {deposit} by bank transfer to the owner. Once she confirms it, nobody else can book that date.
          </p>
          <Link to="/services" className={`${buttonClasses({ variant: "gold", size: "lg" })} mt-7`}>
            Book bridal date
          </Link>
        </div>
        <Photo {...photos.bridalBand} shape="circle" rings={2} className="mx-auto w-64 md:w-80" />
      </div>
      <div className="foil-divider" />
    </section>
  );
}