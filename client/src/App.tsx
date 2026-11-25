import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { AdminLayout } from "./components/Admin/AdminLayout";
import { RequireAdmin } from "./components/Admin/RequireAdmin";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import About from "./pages/About";
import BookingConfirmation from "./pages/BookingConfirmation";
import Book from "./pages/Book";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import ComingSoon from "./pages/ComingSoon";
import Contact from "./pages/Contact";
import DeliveryReturns from "./pages/DeliveryReturns";
import FAQ from "./pages/FAQ";
import Gallery from "./pages/Gallery";
import Home from "./pages/Home";
import ManageBooking from "./pages/ManageBooking";
import OrderConfirmation from "./pages/OrderConfirmation";
import ProductPage from "./pages/ProductPage";
import Services from "./pages/Services";
import Shop from "./pages/Shop";
import StyleGuide from "./pages/StyleGuide";
import AdminHome from "./pages/admin/AdminHome";
import AdminLogin from "./pages/admin/AdminLogin";
import { AdminNotFound, AdminPlaceholder } from "./pages/admin/AdminPlaceholder";

export default function App() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="shop/:slug" element={<ProductPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order/:orderNumber" element={<OrderConfirmation />} />
          <Route path="booking/manage/:token" element={<ManageBooking />} />
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

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminHome />} />
            <Route path="orders" element={<AdminPlaceholder title="Orders" builtIn="FE-T12" />} />
            <Route path="bookings" element={<AdminPlaceholder title="Bookings" builtIn="FE-T12" />} />
            <Route path="inbox" element={<AdminPlaceholder title="Inbox" builtIn="FE-T15" />} />
            <Route path="products" element={<AdminPlaceholder title="Products" builtIn="FE-T13" />} />
            <Route path="services" element={<AdminPlaceholder title="Services" builtIn="FE-T13" />} />
            <Route path="availability" element={<AdminPlaceholder title="Availability" builtIn="FE-T14" />} />
            <Route path="fees" element={<AdminPlaceholder title="Fees" builtIn="FE-T14" />} />
            <Route path="settings" element={<AdminPlaceholder title="Settings" builtIn="FE-T14" />} />
            <Route path="*" element={<AdminNotFound />} />
          </Route>
        </Route>
      </Routes>
    </AdminAuthProvider>
  );
}
