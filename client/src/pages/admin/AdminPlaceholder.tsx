import { useDocumentTitle } from "../../lib/useDocumentTitle";

// Replaced one by one in FE-T12 to FE-T15
export function AdminPlaceholder({ title, builtIn }: { title: string; builtIn: string }) {
  useDocumentTitle(title);
  return (
    <div>
      <h1 className="text-3xl">{title}</h1>
      <p className="mt-3 max-w-prose">This page is not ready yet. It is built in {builtIn}.</p>
    </div>
  );
}

export function AdminNotFound() {
  useDocumentTitle("Page not found");
  return (
    <div>
      <h1 className="text-3xl">We could not find that page</h1>
      <p className="mt-3 max-w-prose">Use the menu to choose where you want to go.</p>
    </div>
  );
}