import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import ComingSoon from "./pages/ComingSoon";
import Home from "./pages/Home";
import StyleGuide from "./pages/StyleGuide";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        {/* A working tool for us, not a public page, so it only exists in `npm run dev` */}
        {import.meta.env.DEV && <Route path="styleguide" element={<StyleGuide />} />}
        {/* Every page we have not built yet */}
        <Route path="*" element={<ComingSoon />} />
      </Route>
    </Routes>
  );
}