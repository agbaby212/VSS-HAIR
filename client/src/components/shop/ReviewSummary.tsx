import { Stars } from "../ui/Stars";
import { averageRating } from "../../features/shop/reviewUtils";
import { useReviews } from "../../features/shop/queries";

// These are reviews of the business, not of this product: the contract has no per-product reviews (Q16).
// Reviews are a nice extra here, so if they fail to load we show nothing instead of an error
export function ReviewSummary() {
  const { data } = useReviews();
  if (!data || data.length === 0) return null;

  const average = averageRating(data);
  const top = data[0];

  return (
    <section aria-label="Customer reviews" className="border-l-2 border-gold pl-4">
      <p className="flex flex-wrap items-center gap-2">
        <Stars rating={Math.round(average)} />
        <span className="font-medium">
          {average} out of 5 from {data.length} {data.length === 1 ? "review" : "reviews"}
        </span>
      </p>
      <figure className="mt-2">
        <blockquote>{top.body}</blockquote>
        <figcaption className="mt-1 text-sm">{top.author}</figcaption>
      </figure>
    </section>
  );
}