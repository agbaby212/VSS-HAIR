import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChipGroup } from "../components/ui/ChipGroup";
import { Photo } from "../components/ui/Photo";
import { Lightbox } from "../features/gallery/Lightbox";
import { GALLERY_CATEGORIES, GALLERY_ITEMS, filterGallery, parseGalleryCategory, type GalleryCategory } from "../lib/gallery";
import { whatsappChatUrl } from "../lib/whatsapp";

const options: { value: GalleryCategory | undefined; label: string }[] = [
  { value: undefined, label: "All" },
  ...GALLERY_CATEGORIES.map((category) => ({ value: category.value, label: category.label })),
];

export default function Gallery() {
  const [params, setParams] = useSearchParams();
  const category = parseGalleryCategory(params.get("type"));
  const items = filterGallery(GALLERY_ITEMS, category);
  const [open, setOpen] = useState<number | null>(null); // index in the filtered list

  function choose(next: GalleryCategory | undefined) {
    setOpen(null);
    setParams(next ? { type: next } : {});
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl">Gallery</h1>
      <p className="mt-2 max-w-prose text-lg">A few of our looks. Tap a photo to see it bigger.</p>

      <div className="mt-6">
        <ChipGroup label="Gallery categories" options={options} value={category} onChange={choose} />
      </div>

      <p role="status" className="mt-4">
        {items.length} {items.length === 1 ? "look" : "looks"}
      </p>

      {items.length === 0 ? (
        <p className="mt-6 max-w-prose">
          Photos are coming soon. Message us on{" "}
          <a href={whatsappChatUrl()} target="_blank" rel="noopener noreferrer" className="text-gold-deep underline underline-offset-4">
            WhatsApp
          </a>{" "}
          to see our latest work.
        </p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item, index) => (
            <li key={item.id}>
              {/* The button's name comes from the text inside it. The picture is decoration (empty alt) */}
              <button type="button" onClick={() => setOpen(index)} className="group block w-full text-center">
                <Photo
                  src={item.photo.src}
                  alt=""
                  width={400}
                  height={400}
                  shape="circle"
                  rings={1}
                  className="mx-auto w-full max-w-[12rem]"
                />
                <span className="mt-3 block font-medium group-hover:underline">{item.title}</span>
                {item.before && <span className="block text-sm">Before and after</span>}
              </button>
            </li>
          ))}
        </ul>
      )}

      <Lightbox items={items} index={open} onChange={setOpen} />
    </div>
  );
}