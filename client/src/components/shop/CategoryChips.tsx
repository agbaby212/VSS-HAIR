import { categories, type CategoryValue } from "../../features/shop/categories";

type CategoryChipsProps = {
  value: CategoryValue | undefined;
  onChange: (value: CategoryValue | undefined) => void;
};

const chip = "min-h-[2.75rem] rounded-full border-2 border-cocoa px-4 font-medium transition-colors";

export function CategoryChips({ value, onChange }: CategoryChipsProps) {
  const items: { value: CategoryValue | undefined; label: string }[] = [{ value: undefined, label: "All" }, ...categories];
  return (
    <nav aria-label="Categories">
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => {
          const selected = item.value === value;
          return (
            <li key={item.label}>
              {/* aria-pressed tells a screen reader which button is on */}
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onChange(item.value)}
                className={`${chip} ${selected ? "bg-cocoa text-ivory" : "bg-transparent text-espresso hover:bg-sand"}`}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}