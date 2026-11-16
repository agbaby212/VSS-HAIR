import { Hero } from "../components/hero/Hero";
import { CategoryCircles } from "../components/shop/CategoryCircles";
import { BridalBand } from "../features/home/BridalBand";
import { PopularProducts } from "../features/home/PopularProducts";
import { ReviewsSection } from "../features/home/ReviewsSection";

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryCircles />
      <PopularProducts />
      <BridalBand />
      <ReviewsSection />
    </>
  );
}