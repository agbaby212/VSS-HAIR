import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ProductGallery } from "../../components/shop/ProductGallery";
import { ReviewSummary } from "../../components/shop/ReviewSummary";
import { VariantPicker } from "../../components/shop/VariantPicker";
import { Button } from "../../components/ui/Button";
import { QuantityStepper } from "../../components/ui/QuantityStepper";
import { MAX_QTY_PER_ITEM } from "../../context/cart";
import { useCart } from "../../context/useCart";
import { naira } from "../../lib/format";
import { whatsappChatUrl } from "../../lib/whatsapp";
import type { Product } from "../../shared";
import { categories } from "./categories";
import { variantLabel } from "./productUtils";
import { ATTRIBUTE_LABELS, getAttributeGroups, optionLabel, pickDefaultVariant } from "./variantSelection";

export function ProductDetails({ product }: { product: Product }) {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const groups = useMemo(() => getAttributeGroups(product), [product]);

  const [selectedId, setSelectedId] = useState(() => pickDefaultVariant(product)?.id);
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  const selected = product.variants.find((variant) => variant.id === selectedId) ?? pickDefaultVariant(product);
  const maxQty = selected ? Math.min(selected.stock, MAX_QTY_PER_ITEM) : 0;
  const quantity = Math.min(qty, Math.max(maxQty, 1)); // changing variant can never leave us above stock
  const canBuy = selected !== undefined && maxQty > 0;

  const categoryLabel = categories.find((category) => category.value === product.category)?.label;
  const firstImage = product.media.find((item) => item.type === "image");
  const label = selected ? variantLabel(selected) : null;

  function handleAdd(buyNow: boolean) {
    if (!selected || !canBuy) return;
    const result = addItem(
      {
        variantId: selected.id,
        productSlug: product.slug,
        productName: product.name,
        variantLabel: label,
        unitPriceKobo: selected.priceKobo,
        imageUrl: firstImage?.url ?? null,
        maxQty,
      },
      quantity,
    );
    if (buyNow) {
      navigate("/checkout"); // the bag now holds this item, so checkout will see it
      return;
    }
    setMessage(result === "capped" ? "Your bag already has the most we have in stock." : "Added to your bag.");
  }

  // An enquiry, not an order, so the page may build it. (Order messages come from the server.)
  const enquiryUrl = whatsappChatUrl(
    `Hello VSS Hair, I have a question about ${product.name}${label ? ` (${label})` : ""}.\n${window.location.href}`,
  );

  const stockText =
    !selected || selected.stock === 0 ? "Sold out" : selected.stock <= 5 ? `Only ${selected.stock} left` : "In stock";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-x-2 text-sm">
          <li>
            <Link to="/shop" className="underline underline-offset-4">Shop</Link>
          </li>
          <li aria-hidden="true">›</li>
          <li>
            <Link to={`/shop?category=${product.category}`} className="underline underline-offset-4">{categoryLabel}</Link>
          </li>
          <li aria-hidden="true">›</li>
          <li aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductGallery media={product.media} name={product.name} />

        <div>
          <h1 className="text-3xl sm:text-4xl">{product.name}</h1>

          {selected && <p className="mt-3 font-display text-3xl text-gold-deep">{naira(selected.priceKobo)}</p>}
          <p className="mt-1 font-medium" role="status">{stockText}</p>

          {selected && groups.choices.length > 0 && (
            <div className="mt-6">
              <VariantPicker product={product} groups={groups.choices} selected={selected} onSelect={(variant) => setSelectedId(variant.id)} />
            </div>
          )}

          {selected && groups.facts.length > 0 && (
            <dl className="mt-5 space-y-1">
              {groups.facts.map((fact) => (
                <div key={fact.key} className="flex gap-2">
                  <dt className="font-medium">{ATTRIBUTE_LABELS[fact.key]}:</dt>
                  <dd>{optionLabel(fact.key, fact.values[0])}</dd>
                </div>
              ))}
            </dl>
          )}

          {canBuy ? (
            <div className="mt-6">
              <p className="mb-2 font-medium">Quantity</p>
              <QuantityStepper value={quantity} max={maxQty} onChange={setQty} />
            </div>
          ) : (
            <p className="mt-6 max-w-prose">This is sold out right now. Ask us on WhatsApp and we will tell you what we can do.</p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" disabled={!canBuy} onClick={() => handleAdd(false)}>
              {canBuy ? "Add to bag" : "Sold out"}
            </Button>
            <Button size="lg" variant="secondary" disabled={!canBuy} onClick={() => handleAdd(true)}>
              Buy now
            </Button>
          </div>

          <p role="status" className="mt-3 min-h-[1.5rem]">
            {message}{" "}
            {message && !message.startsWith("Your bag already") && (
              <Link to="/cart" className="text-gold-deep underline underline-offset-4">View bag</Link>
            )}
          </p>

          <p className="mt-2 max-w-prose text-sm">
            You send your order to us on WhatsApp, then pay by bank transfer to the owner. The delivery fee is added at checkout, by state.
          </p>

          <div className="mt-6">
            <ReviewSummary />
          </div>

          <a
            href={enquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-[2.75rem] items-center text-gold-deep underline underline-offset-4"
          >
            Ask about this on WhatsApp
          </a>
        </div>
      </div>

      {(product.description || product.texture) && (
        <section aria-labelledby="about-title" className="mt-14 max-w-prose">
          <h2 id="about-title" className="text-2xl">About this product</h2>
          {product.description && <p className="mt-3">{product.description}</p>}
          {product.texture && <p className="mt-3"><span className="font-medium">Texture:</span> {product.texture}</p>}
        </section>
      )}
    </div>
  );
}