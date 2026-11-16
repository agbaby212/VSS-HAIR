// The stars are decoration. The label tells a screen reader the real information
export function Stars({ rating }: { rating: number }) {
  return (
    <span role="img" aria-label={`${rating} out of 5 stars`} className="text-lg tracking-widest text-gold-deep">
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}