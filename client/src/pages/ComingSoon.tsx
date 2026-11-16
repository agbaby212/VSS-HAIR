import { Link } from "react-router-dom";
import { buttonClasses } from "../components/ui/buttonClasses";

export default function ComingSoon() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-4xl">This page is not ready yet</h1>
      <p className="mt-3 max-w-prose">We are still building it. Go back to the homepage for now.</p>
      <Link to="/" className={`${buttonClasses()} mt-6`}>
        Back to the homepage
      </Link>
    </section>
  );
}