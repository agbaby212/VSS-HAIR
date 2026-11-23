import { Button } from "../ui/Button";

type SearchFormProps = {
  value: string | undefined; // the search text currently in the address bar
  onSearch: (value: string | undefined) => void;
};

export function SearchForm({ value, onSearch }: SearchFormProps) {
  return (
    <form
      // key makes React rebuild the form when the address changes (for example "Clear all"), so the box empties too
      key={value ?? ""}
      role="search"
      className="flex max-w-xl gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const text = String(new FormData(event.currentTarget).get("q") ?? "").trim();
        onSearch(text === "" ? undefined : text);
      }}
    >
      <label htmlFor="shop-search" className="sr-only">
        Search the shop
      </label>
      <input
        id="shop-search"
        name="q"
        type="search"
        defaultValue={value ?? ""}
        maxLength={80}
        placeholder="Search, for example body wave"
        className="min-h-[2.75rem] w-full border-2 border-cocoa bg-ivory px-3 text-espresso"
      />
      <Button type="submit">Search</Button>
    </form>
  );
}