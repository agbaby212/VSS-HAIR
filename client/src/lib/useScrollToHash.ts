import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// A link like /services#bridal arrives before the data (and so the section) exists.
// Call this with `ready = true` once the content is on the page, and it scrolls then
export function useScrollToHash(ready: boolean): void {
  const { hash } = useLocation();
  useEffect(() => {
    if (!ready || !hash) return;
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: "start" });
  }, [ready, hash]);
}