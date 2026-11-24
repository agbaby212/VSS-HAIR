import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useCart } from "../context/useCart";
import { CheckoutForm } from "../features/checkout/CheckoutForm";
import { useBagLines } from "../features/checkout/useBagLines";

export default function Checkout() {
  const { items } = useCart();
  const lines = useBagLines(items);
  // Set by the form just before it empties the bag, so we do not redirect to the bag at that moment
  const [orderPlaced, setOrderPlaced] = useState(false);

  if (items.length === 0 && !orderPlaced) return <Navigate to="/cart" replace />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/cart" className="inline-flex min-h-[2.75rem] items-center text-gold-deep underline underline-offset-4">
        ‹ Back to your bag
      </Link>
      <h1 className="text-4xl">Checkout</h1>
      <CheckoutForm lines={lines} onPlaced={() => setOrderPlaced(true)} />
    </div>
  );
}