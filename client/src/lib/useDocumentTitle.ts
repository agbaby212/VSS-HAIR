import { useEffect } from "react";

// The tab title is read aloud when a page opens, so each admin page sets its own
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} | VSS Hair admin`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}