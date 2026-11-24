import { useState } from "react";
import type { Product } from "../../shared";
import { Photo } from "../ui/Photo";

type ProductGalleryProps = { media: Product["media"]; name: string };

export function ProductGallery({ media, name }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const current = media[index];

  return (
    <div>
      {!current && <Photo alt="" width={800} height={1000} shape="rect" className="w-full" />}

      {current?.type === "image" && (
        <Photo
          key={current.url}
          src={current.url}
          alt={media.length > 1 ? `${name}, photo ${index + 1} of ${media.length}` : name}
          width={800}
          height={1000}
          shape="rect"
          priority // this is the biggest image on the page
          className="w-full"
        />
      )}

      {current?.type === "video" && (
        <video key={current.url} src={current.url} controls playsInline preload="metadata" aria-label={`${name}, video`} className="w-full bg-sand" />
      )}

      {media.length > 1 && (
        <ul className="mt-4 flex gap-3 overflow-x-auto px-1 py-2">
          {media.map((item, i) => (
            <li key={item.url} className="shrink-0">
              <button
                type="button"
                aria-pressed={i === index}
                aria-label={item.type === "video" ? "Show the video" : `Show photo ${i + 1} of ${media.length}`}
                onClick={() => setIndex(i)}
                className={`block rounded-full border-2 p-1 ${i === index ? "border-gold-deep" : "border-transparent"}`}
              >
                {item.type === "image" ? (
                  <Photo src={item.url} alt="" width={160} height={160} shape="circle" className="w-16" />
                ) : (
                  // We have no still picture for a video, so a sand circle says what it is
                  <span aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-full bg-sand text-sm font-medium">
                    Video
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}