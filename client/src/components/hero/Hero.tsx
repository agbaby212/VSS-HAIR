import { Link } from "react-router-dom";
import { buttonClasses } from "../ui/buttonClasses";
import { HeroCircles } from "./HeroCircles";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 lg:grid-cols-[1.1fr_1fr] lg:py-20">
      <div>
        <h1 className="max-w-xl text-4xl sm:text-5xl lg:text-6xl lg:leading-[1.05]">
          Order your hair or book your appointment in a few taps
        </h1>
        <p className="mt-5 max-w-prose text-lg">
          Choose bundles, frontals or wigs, or reserve a salon, home or bridal slot. Then send it to us on
          WhatsApp. You pay by bank transfer straight to the owner after she replies. This site never takes payment.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link to="/shop" className={buttonClasses({ size: "lg" })}>
            Shop hair
          </Link>
          <Link to="/book" className={buttonClasses({ variant: "secondary", size: "lg" })}>
            Book appointment
          </Link>
        </div>
      </div>
      <HeroCircles />
    </section>
  );
}