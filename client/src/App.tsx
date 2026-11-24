import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import ComingSoon from "./pages/ComingSoon";
import Home from "./pages/Home";
import OrderConfirmation from "./pages/OrderConfirmation";
import ProductPage from "./pages/ProductPage";
import Shop from "./pages/Shop";
import StyleGuide from "./pages/StyleGuide";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="shop/:slug" element={<ProductPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order/:orderNumber" element={<OrderConfirmation />} />
        {/* A working tool for us, not a public page, so it only exists in `npm run dev` */}
        {import.meta.env.DEV && <Route path="styleguide" element={<StyleGuide />} />}
        {/* Every page we have not built yet */}
        <Route path="*" element={<ComingSoon />} />
      </Route>
    </Routes>
  );
}