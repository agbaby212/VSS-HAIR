import { useEffect } from "react";

// For pages whose address contains a secret. The tags exist only while the page is open
export function useNoIndex(): void {
  useEffect(() => {
    const tags = [
      { name: "robots", content: "noindex, nofollow" },
      { name: "referrer", content: "no-referrer" },
    ].map(({ name, content }) => {
      const meta = document.createElement("meta");
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
      return meta;
    });
    return () => tags.forEach((meta) => meta.remove());
  }, []);
}