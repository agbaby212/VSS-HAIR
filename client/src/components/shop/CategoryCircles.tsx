import { Link } from "react-router-dom";
import { photos } from "../../lib/photos";
import { categories } from "../../features/shop/categories";
import { Photo } from "../ui/Photo";

export function CategoryCircles() {
  return (
    <section aria-labelledby="categories-title" className="mx-auto max-w-6xl px-4 py-12">
      <h2 id="categories-title" className="text-3xl">
        Shop by type
      </h2>
      {/* Phones: a row you swipe sideways. Desktop: five in a grid.
          The padding keeps the keyboard focus ring from being cut off by the scroll box */}
      <ul className="mt-6 flex snap-x gap-6 overflow-x-auto px-1 py-2 lg:grid lg:grid-cols-5 lg:overflow-visible">
        {categories.map((category) => (
          <li key={category.value} className="w-28 shrink-0 snap-start sm:w-32 lg:w-auto">
            <Link to={`/shop?category=${category.value}`} className="group block text-center">
              <Photo {...photos.categories[category.value]} shape="circle" rings={1} className="mx-auto w-full max-w-[10rem]" />
              <span className="mt-3 block font-medium group-hover:underline">{category.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}