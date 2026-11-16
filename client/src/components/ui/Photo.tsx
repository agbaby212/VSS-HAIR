import type { ReactNode } from "react";

type PhotoProps = {
  src?: string; // leave out to show the sand placeholder
  alt: string;
  width: number; // the file's real pixel size. Lets the browser reserve space
  height: number;
  shape?: "circle" | "arch" | "rect";
  rings?: 0 | 1 | 2; // fine gold rings, circle only
  priority?: boolean;
  className?: string; // set the displayed size here, like "w-40"
};

const shapeClass = {
  circle: "rounded-full",
  arch: "rounded-t-full",
  rect: "rounded-sm",
} as const;

function Ring({ children }: { children: ReactNode }) {
  // The padding is the gap between the photo and the ring
  return <div className="rounded-full border border-gold p-1.5">{children}</div>;
}

export function Photo({
  src,
  alt,
  width,
  height,
  shape = "circle",
  rings = 0,
  priority = false,
  className = "",
}: PhotoProps) {
  const ringCount = shape === "circle" ? rings : 0; // rings only fit circles
  const style = { aspectRatio: `${width} / ${height}` };

  let content: ReactNode = src ? (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      style={style}
      className={`w-full object-cover ${shapeClass[shape]}`}
    />
  ) : (
    <div role="img" aria-label={alt} style={style} className={`w-full bg-sand ${shapeClass[shape]}`} />
  );

  for (let i = 0; i < ringCount; i += 1) {
    content = <Ring>{content}</Ring>;
  }

  return <div className={className}>{content}</div>;
}