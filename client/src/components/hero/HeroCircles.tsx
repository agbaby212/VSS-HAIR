import { photos } from "../../lib/photos";
import { Photo } from "../ui/Photo";

export function HeroCircles() {
  const { main, detail, bridal } = photos.hero;
  return (
    // A square box: the percentages below then keep the same overlap at every screen size
    <div className="relative mx-auto aspect-square w-full max-w-[32rem]">
      {/* A thin gold ring behind the photos. Decoration only */}
      <div aria-hidden="true" className="absolute inset-[5%] rounded-full border border-gold" />

      <div className="settle absolute left-0 top-[10%] w-[66%]">
        {/* priority: this is the first big image, so it loads at once */}
        <Photo {...main} shape="circle" rings={2} priority className="w-full" />
      </div>
      <div className="settle absolute right-0 top-0 w-[34%]" style={{ animationDelay: "120ms" }}>
        <Photo {...detail} shape="circle" rings={1} className="w-full" />
      </div>
      <div className="settle absolute bottom-0 right-[2%] w-[42%]" style={{ animationDelay: "240ms" }}>
        <Photo {...bridal} shape="circle" rings={1} className="w-full" />
      </div>
    </div>
  );
}