import { Link } from "react-router-dom";
import { fromPriceKobo, isSoldOut } from "../../features/shop/productUtils";
import { naira } from "../../lib/format";
import type { Product } from "../../shared";
import { Photo } from "../ui/Photo";

type ProductCardProps = {
  product: Product;
  featured?: boolean; // the most important item: arch photo on a sand panel
};

export function ProductCard({ product, featured = false }: ProductCardProps) {
  const soldOut = isSoldOut(product);
  const image = product.media.find((item) => item.type === "image");

  return (
    <Link to={`/shop/${product.slug}`} className={`group block ${featured ? "h-full bg-sand p-4 sm:p-6" : ""}`}>
      <Photo
        src={image?.url}
        alt={image ? product.name : ""}
        width={600}
        height={featured ? 640 : 600} // the card's shape. object-cover crops real photos to fit
        shape={featured ? "arch" : "rect"}
        className={soldOut ? "w-full opacity-60" : "w-full"}
      />
      <h3 className={`mt-3 group-hover:underline ${featured ? "text-2xl" : "text-xl"}`}>{product.name}</h3>
      {soldOut ? (
        <p className="mt-1 font-medium">Sold out</p>
      ) : (
        <p className="mt-1 font-display text-lg text-gold-deep">From {naira(fromPriceKobo(product))}</p>
      )}
    </Link>
  );
}