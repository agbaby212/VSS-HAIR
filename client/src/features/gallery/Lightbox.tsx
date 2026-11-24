import { useEffect, useRef } from "react";
import { Button } from "../../components/ui/Button";
import { Photo } from "../../components/ui/Photo";
import type { GalleryItem } from "../../lib/gallery";

type LightboxProps = {
  items: GalleryItem[];
  index: number | null; // which look is open, or null when closed
  onChange: (index: number | null) => void;
};

export function Lightbox({ items, index, onChange }: LightboxProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const item = index === null ? undefined : items[index];

  // Open or close the real dialog to match our state
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (item && !dialog.open) dialog.showModal();
    if (!item && dialog.open) dialog.close();
  }, [item]);

  function move(step: number) {
    if (index === null) return;
    onChange((index + step + items.length) % items.length); // wraps round at both ends
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby="lightbox-title"
      onClose={() => onChange(null)} // fires for Escape and for our Close button
      onClick={(event) => {
        if (event.target === event.currentTarget) onChange(null); // a click on the dark backdrop
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") move(1);
        if (event.key === "ArrowLeft") move(-1);
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-3xl bg-ivory p-0 text-espresso backdrop:bg-black/70"
    >
      {item && index !== null && (
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id="lightbox-title" className="text-2xl">
              {item.title}
            </h2>
            <Button variant="secondary" onClick={() => onChange(null)}>
              Close
            </Button>
          </div>

          <div className={`mt-4 grid gap-4 ${item.before ? "sm:grid-cols-2" : ""}`}>
            {item.before && (
              <figure>
                <Photo src={item.before.src} alt={item.before.alt} width={1000} height={1000} shape="rect" priority className="w-full" />
                <figcaption className="mt-1 font-medium">Before</figcaption>
              </figure>
            )}
            <figure className={item.before ? "" : "mx-auto w-full max-w-xl"}>
              <Photo src={item.photo.src} alt={item.photo.alt} width={1000} height={1000} shape="rect" priority className="w-full" />
              {item.before && <figcaption className="mt-1 font-medium">After</figcaption>}
            </figure>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4">
            <Button variant="secondary" onClick={() => move(-1)}>
              Previous look
            </Button>
            <p role="status">
              {index + 1} of {items.length}
            </p>
            <Button variant="secondary" onClick={() => move(1)}>
              Next look
            </Button>
          </div>
        </div>
      )}
    </dialog>
  );
}