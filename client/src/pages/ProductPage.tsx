import { Link, useParams } from "react-router-dom";
import { ErrorNotice } from "../components/ui/ErrorNotice";
import { buttonClasses } from "../components/ui/buttonClasses";
import { ProductDetails } from "../features/shop/ProductDetails";
import { useProduct } from "../features/shop/queries";
import { ApiError } from "../lib/api";

function ProductSkeleton() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 lg:grid-cols-2" aria-busy="true">
      <p className="sr-only" role="status">Loading product</p>
      <div aria-hidden="true" className="aspect-[4/5] animate-pulse bg-sand" />
      <div aria-hidden="true" className="space-y-4">
        <div className="h-10 w-3/4 animate-pulse bg-sand" />
        <div className="h-8 w-1/3 animate-pulse bg-sand" />
        <div className="h-24 animate-pulse bg-sand" />
        <div className="h-12 animate-pulse bg-sand" />
      </div>
    </div>
  );
}

export default function ProductPage() {
  const { slug = "" } = useParams();
  const query = useProduct(slug);

  if (query.isPending) return <ProductSkeleton />;

  if (query.isError) {
    if (query.error instanceof ApiError && query.error.status === 404) {
      return (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h1 className="text-4xl">We could not find that product</h1>
          <p className="mt-3 max-w-prose">It may have been removed, or the link may be wrong. Have a look at everything in the shop.</p>
          <Link to="/shop" className={`${buttonClasses()} mt-6`}>Back to the shop</Link>
        </section>
      );
    }
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <ErrorNotice error={query.error} onRetry={() => void query.refetch()} title="We could not load this product" />
      </div>
    );
  }

  // key resets the page state (chosen variant, quantity) when you move to a different product
  return <ProductDetails key={query.data.id} product={query.data} />;
}