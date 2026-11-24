type QuantityStepperProps = {
  value: number;
  max: number; // never above the stock
  onChange: (value: number) => void;
};

const stepButton =
  "flex h-11 w-11 items-center justify-center rounded-full border-2 border-cocoa text-xl transition-colors hover:bg-sand disabled:cursor-not-allowed disabled:opacity-60";

export function QuantityStepper({ value, max, onChange }: QuantityStepperProps) {
  return (
    <div role="group" aria-label="Quantity" className="inline-flex items-center gap-3">
      <button type="button" className={stepButton} aria-label="Decrease quantity" disabled={value <= 1} onClick={() => onChange(value - 1)}>
        <span aria-hidden="true">−</span>
      </button>
      {/* aria-live: a screen reader hears the new number after each tap */}
      <span aria-live="polite" className="min-w-[2ch] text-center text-lg font-medium">
        {value}
      </span>
      <button type="button" className={stepButton} aria-label="Increase quantity" disabled={value >= max} onClick={() => onChange(value + 1)}>
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}