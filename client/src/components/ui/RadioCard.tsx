import type { ReactNode } from "react";

type RadioCardProps = {
  name: string;
  value: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  children: ReactNode;
};

// A real radio button, hidden but still focusable (arrow keys work, screen readers read it).
// The span after it is what people see. "peer-" classes style the span from the radio's state.
// The chosen card is sand with a gold inset ring, not a dark fill, so gold prices stay readable on it
export function RadioCard({ name, value, checked, disabled = false, onChange, children }: RadioCardProps) {
  return (
    <label className="block">
      <input type="radio" name={name} value={value} checked={checked} disabled={disabled} onChange={onChange} className="peer sr-only" />
      <span
        className={
          "block cursor-pointer border-2 border-cocoa bg-ivory p-4 " +
          "peer-checked:bg-sand peer-checked:shadow-[inset_0_0_0_3px_var(--color-gold-deep)] " +
          "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-deep " +
          "peer-disabled:cursor-not-allowed peer-disabled:border-dashed"
        }
      >
        {children}
      </span>
    </label>
  );
}