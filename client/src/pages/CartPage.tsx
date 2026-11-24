import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { buttonClasses } from "../components/ui/buttonClasses";
import { useCart } from "../context/useCart";
import { BagLine } from "../features/checkout/BagLine";
import { canCheckout, subtotalKobo } from "../features/checkout/bagCheck";
import { useBagLines } from "../features/checkout/useBagLines";
import { naira } from "../lib/format";

export default function CartPage() {
  const { items, setQty, removeItem } = useCart();
  const lines = useBagLines(items);

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl">Your bag is empty</h1>
        <p className="mt-3 max-w-prose">Choose some hair or book an appointment, and it will wait for you here.</p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link to="/shop" className={buttonClasses({ size: "lg" })}>Shop hair</Link>
          <Link to="/book" className={buttonClasses({ variant: "secondary", size: "lg" })}>Book appointment</Link>
        </div>
      </section>
    );
  }

  const ready = canCheckout(lines);
  const checking = lines.some((line) => line.status === "checking");
  const unchecked = lines.some((line) => line.status === "unchecked");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl">Your bag</h1>

      <div className="mt-6 lg:grid lg:grid-cols-[1fr_22rem] lg:gap-12">
        <ul aria-label="Items in your bag" className="border-t border-sand">
          {lines.map((line) => (
            <BagLine
              key={line.item.variantId}
              line={line}
              onQty={(qty) => setQty(line.item.variantId, qty)}
              onRemove={() => removeItem(line.item.variantId)}
            />
          ))}
        </ul>

        <aside aria-label="Bag summary" className="mt-8 h-fit bg-sand p-6 lg:mt-0">
          {/* role="status": the new total is read aloud after you change a quantity */}
          <p role="status" className="flex items-baseline justify-between gap-4 text-lg">
            <span>Subtotal</span>
            <span className="font-display text-2xl text-gold-deep">{naira(subtotalKobo(lines))}</span>
          </p>
          <p className="mt-2 text-sm">The delivery fee is added at checkout, once you choose your state.</p>
          <p className="mt-2 text-sm">
            You send your order to us on WhatsApp, then pay by bank transfer to the owner. This site never takes payment.
          </p>

          {ready ? (
            <Link to="/checkout" className={`${buttonClasses({ size: "lg" })} mt-5 w-full`}>
              Checkout
            </Link>
          ) : (
            <>
              <Button size="lg" className="mt-5 w-full" disabled>
                Checkout
              </Button>
              <p className="mt-2 text-sm">{checking ? "Checking prices and stock" : "Fix the items marked in your bag to continue."}</p>
            </>
          )}
          {ready && unchecked && (
            <p className="mt-2 text-sm">We could not check stock just now. Prices and stock are checked again when you send your order.</p>
          )}

          <Link to="/shop" className="mt-4 inline-flex min-h-[2.75rem] items-center text-gold-deep underline underline-offset-4">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}