import { useId } from "react";

export type SelectOption = { value: string; label: string };

type SelectProps = {
  label: string;
  value: string; // "" means "any"
  onChange: (value: string) => void;
  options: SelectOption[];
  anyLabel?: string;
};

// A visible label (never a placeholder as a label), a tall tap target, native dropdown for easy phone use
export function Select({ label, value, onChange, options, anyLabel = "Any" }: SelectProps) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block font-medium">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 min-h-[2.75rem] w-full border-2 border-cocoa bg-ivory px-3 text-espresso"
      >
        <option value="">{anyLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}