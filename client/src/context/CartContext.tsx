import { useEffect, useMemo, useState, type ReactNode } from "react";
import { addToCart, cartCount, loadCart, saveCart, type CartItem } from "./cart";
import { CartContext, type CartContextValue } from "./cartContext";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart); // loadCart runs once, at start

  // Save to the phone every time the bag changes
  useEffect(() => {
    saveCart(items);
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: cartCount(items),
      addItem: (item, qty) => {
        const result = addToCart(items, item, qty);
        setItems(result.items);
        return result.capped ? "capped" : "added";
      },
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}