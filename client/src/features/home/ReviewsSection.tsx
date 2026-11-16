import { ErrorNotice } from "../../components/ui/ErrorNotice";
import { Stars } from "../../components/ui/Stars";
import type { Review } from "../../shared";
import { useReviews } from "../shop/queries";

function ReviewCard({ review, featured }: { review: Review; featured: boolean }) {
  return (
    // One big card on sand, two slim ones with a gold edge: not three identical boxes
    <figure className={featured ? "bg-sand p-6 sm:p-8 lg:row-span-2" : "border-l-2 border-gold pl-5"}>
      <Stars rating={review.rating} />
      <blockquote className={`mt-3 ${featured ? "font-display text-2xl leading-snug" : ""}`}>{review.body}</blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-gold bg-ivory font-display text-lg"
        >
          {review.author.charAt(0)}
        </span>
        <span className="font-medium">{review.author}</span>
      </figcaption>
    </figure>
  );
}

export function ReviewsSection() {
  const { data, isPending, isError, error, refetch } = useReviews();
  const reviews = (data ?? []).slice(0, 3);

  // Nothing to show and nothing wrong: hide the whole section instead of an empty heading
  if (data && reviews.length === 0) return null;

  return (
    <section aria-labelledby="reviews-title" className="mx-auto max-w-6xl px-4 py-12">
      <h2 id="reviews-title" className="text-3xl">
        What customers say
      </h2>

      {isPending && (
        <div className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <p className="sr-only" role="status">
            Loading reviews
          </p>
          <div aria-hidden="true" className="h-48 animate-pulse bg-sand lg:row-span-2 lg:h-auto" />
          <div aria-hidden="true" className="h-24 animate-pulse bg-sand" />
          <div aria-hidden="true" className="h-24 animate-pulse bg-sand" />
        </div>
      )}

      {isError && (
        <div className="mt-6">
          <ErrorNotice error={error} onRetry={() => void refetch()} title="We could not load the reviews" />
        </div>
      )}

      {reviews.length > 0 && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          {reviews.map((review, index) => (
            <ReviewCard key={review.id} review={review} featured={index === 0} />
          ))}
        </div>
      )}
    </section>
  );
}