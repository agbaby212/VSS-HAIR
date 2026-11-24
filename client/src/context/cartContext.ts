import { createContext } from "react";
import type { CartItem, NewCartItem } from "./cart";

export type CartContextValue = {
  items: CartItem[];
  count: number; // total pieces, for the header
  addItem: (item: NewCartItem, qty: number) => "added" | "capped";
  setQty: (variantId: string, qty: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void; // used after an order is sent (part 2)
};

// null means "no provider above this component", which useCart turns into a clear error
export const CartContext = createContext<CartContextValue | null>(null);