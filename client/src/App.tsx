import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import ComingSoon from "./pages/ComingSoon";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Gallery from "./pages/Gallery";
import Home from "./pages/Home";
import OrderConfirmation from "./pages/OrderConfirmation";
import ProductPage from "./pages/ProductPage";
import BookingConfirmation from "./pages/BookingConfirmation";
import Shop from "./pages/Shop";
import Book from "./pages/Book";
import StyleGuide from "./pages/StyleGuide";
import Contact from "./pages/Contact";
import DeliveryReturns from "./pages/DeliveryReturns";
import Services from "./pages/Services";


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
        <Route path="booking/:ref" element={<BookingConfirmation />} />
        <Route path="book" element={<Book />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="about" element={<About />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="contact" element={<Contact />} />
        <Route path="delivery-returns" element={<DeliveryReturns />} />
        <Route path="services" element={<Services />} />
        {/* A working tool for us, not a public page, so it only exists in `npm run dev` */}
        {import.meta.env.DEV && <Route path="styleguide" element={<StyleGuide />} />}
        {/* Every page we have not built yet */}
        <Route path="*" element={<ComingSoon />} />
      </Route>
    </Routes>
  );
}