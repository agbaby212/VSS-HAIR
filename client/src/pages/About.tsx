import { Link } from "react-router-dom";
import { Photo } from "../components/ui/Photo";
import { buttonClasses } from "../components/ui/buttonClasses";
import { usePublicSettings } from "../features/shop/queries";
import { photos } from "../lib/photos";

export default function About() {
  const { data: settings } = usePublicSettings();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="grid items-center gap-8 md:grid-cols-[1fr_16rem]">
        <div>
          <h1 className="text-4xl">About VSS Hair</h1>
          <p className="mt-3 max-w-prose text-lg">
            VSS Hair sells hair and offers hair, bridal and beauty services in {settings?.business.city ?? "[Benin City]"}.
          </p>
        </div>
        <Photo {...photos.about} shape="circle" rings={2} className="mx-auto w-48 md:w-full" />
      </div>

      <section aria-labelledby="story-title" className="mt-12">
        <h2 id="story-title" className="text-3xl">Our story</h2>
        <div className="mt-3 max-w-prose border-l-4 border-gold-deep pl-4">
          <p>[REPLACE] The owner writes her story here, in her own words: her name, how she started, how long she has been doing hair, and what she is proud of.</p>
          <p className="mt-3">[REPLACE] One or two lines about who she loves to work for (brides, busy professionals, everyone).</p>
        </div>
      </section>

      <section aria-labelledby="how-title" className="mt-12">
        <h2 id="how-title" className="text-3xl">How we work</h2>
        <ul className="mt-3 max-w-prose list-disc space-y-2 pl-5">
          <li>You choose your hair or your appointment on this site.</li>
          <li>You send it to the owner on WhatsApp, so you talk to her directly.</li>
          <li>She replies with her account details, and you pay by bank transfer. This site never takes payment.</li>
          <li>
            Unpaid orders and bookings are held for a set time, then released.{" "}
            {settings ? `Right now that is ${settings.orderHoldHours} hours for orders.` : ""}
          </li>
        </ul>
      </section>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link to="/shop" className={buttonClasses({ size: "lg" })}>
          Shop hair
        </Link>
        <Link to="/services" className={buttonClasses({ variant: "secondary", size: "lg" })}>
          See services
        </Link>
      </div>
    </div>
  );
}