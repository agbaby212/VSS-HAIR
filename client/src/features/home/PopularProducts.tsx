import { Link } from "react-router-dom";
import { ProductCard } from "../../components/shop/ProductCard";
import { ErrorNotice } from "../../components/ui/ErrorNotice";
import { whatsappChatUrl } from "../../lib/whatsapp";
import { useProducts } from "../shop/queries";
import { isSoldOut } from "../shop/productUtils";

// Featured card spans two columns, and two rows on desktop, so 1 featured + 4 normal fills a 4 x 2 grid
const gridClass = "mt-6 grid grid-cols-2 gap-5 lg:grid-cols-4";

export function PopularProducts() {
  const { data, isPending, isError, error, refetch } = useProducts({ pageSize: 8 });

  // Show products people can still buy first. (sort is stable, so the shop's own order is kept)
  const items = data
    ? [...data.data].sort((a, b) => Number(isSoldOut(a)) - Number(isSoldOut(b))).slice(0, 5)
    : [];

  return (
    <section aria-labelledby="products-title" className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-end justify-between gap-4">
        <h2 id="products-title" className="text-3xl">
          From the shop
        </h2>
        <Link to="/shop" className="py-2 text-gold-deep underline underline-offset-4">
          See all hair
        </Link>
      </div>

      {isPending && (
        <div className={gridClass}>
          <p className="sr-only" role="status">
            Loading products
          </p>
          {[0, 1, 2, 3, 4].map((n) => (
            <div key={n} aria-hidden="true" className={`animate-pulse bg-sand ${n === 0 ? "col-span-2 h-80 lg:row-span-2 lg:h-auto" : "h-48"}`} />
          ))}
        </div>
      )}

      {isError && (
        <div className="mt-6">
          <ErrorNotice error={error} onRetry={() => void refetch()} title="We could not load the shop" />
        </div>
      )}

      {data && items.length === 0 && (
        <p className="mt-6 max-w-prose">
          We are adding hair to the shop. Message us on{" "}
          <a href={whatsappChatUrl()} target="_blank" rel="noopener noreferrer" className="text-gold-deep underline underline-offset-4">
            WhatsApp
          </a>{" "}
          to ask what is in stock.
        </p>
      )}

      {items.length > 0 && (
        <div className={gridClass}>
          {items.map((product, index) => (
            <div key={product.id} className={index === 0 ? "col-span-2 lg:row-span-2" : ""}>
              <ProductCard product={product} featured={index === 0} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}