type Option<T extends string> = { value: T | undefined; label: string }; // undefined means "All"

type ChipGroupProps<T extends string> = {
  label: string; // names the group for a screen reader
  options: Option<T>[];
  value: T | undefined;
  onChange: (value: T | undefined) => void;
};

const chip = "min-h-[2.75rem] rounded-full border-2 border-cocoa px-4 font-medium transition-colors";

export function ChipGroup<T extends string>({ label, options, value, onChange }: ChipGroupProps<T>) {
  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <li key={option.label}>
              {/* aria-pressed tells a screen reader which button is on */}
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onChange(option.value)}
                className={`${chip} ${selected ? "bg-cocoa text-ivory" : "bg-transparent text-espresso hover:bg-sand"}`}
              >
                {option.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}