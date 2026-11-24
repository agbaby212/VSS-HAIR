import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { addToCart, cartCount, loadCart, removeFromCart, saveCart, setItemQty, type CartItem } from "./cart";
import { CartContext, type CartContextValue } from "./cartContext";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart); // loadCart runs once, at start

  // Save to storage every time the bag changes
  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addItem = useCallback<CartContextValue["addItem"]>((item, qty) => {
    let status: "added" | "capped" = "added";

    setItems((prev) => {
      const result = addToCart(prev, item, qty);
      status = result.capped ? "capped" : "added";
      return result.items;
    });

    return status;
  }, []);

  const setQty = useCallback<CartContextValue["setQty"]>((variantId, qty) => {
    setItems((prev) => setItemQty(prev, variantId, qty));
  }, []);

  const removeItem = useCallback<CartContextValue["removeItem"]>((variantId) => {
    setItems((prev) => removeFromCart(prev, variantId));
  }, []);

  const clear = useCallback<CartContextValue["clear"]>(() => {
    setItems([]);
  }, []);

  const count = useMemo(() => cartCount(items), [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count,
      addItem,
      setQty,
      removeItem,
      clear,
    }),
    [items, count, addItem, setQty, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}