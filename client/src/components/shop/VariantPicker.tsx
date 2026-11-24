import {
  isOptionAvailable, optionLabel, selectOption, type AttributeGroup,
} from "../../features/shop/variantSelection";
import type { Product, Variant } from "../../shared";

type VariantPickerProps = {
  product: Product;
  groups: AttributeGroup[]; // only the attributes the customer chooses
  selected: Variant;
  onSelect: (variant: Variant) => void;
};

export function VariantPicker({ product, groups, selected, onSelect }: VariantPickerProps) {
  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <fieldset key={group.key}>
          <legend className="font-medium">
            {group.label}: <span className="font-normal">{selected[group.key] !== null ? optionLabel(group.key, selected[group.key] as string | number) : ""}</span>
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {group.values.map((value) => {
              const available = isOptionAvailable(product, group.key, value);
              return (
                <label key={String(value)}>
                  {/* A real radio button, hidden but still focusable. The span after it is what people see.
                      "peer-" classes style the span from the radio's state */}
                  <input
                    type="radio"
                    name={`option-${group.key}`}
                    value={String(value)}
                    checked={selected[group.key] === value}
                    disabled={!available}
                    onChange={() => onSelect(selectOption(product, selected, group.key, value))}
                    className="peer sr-only"
                  />
                  <span
                    className={
                      "flex min-h-[2.75rem] cursor-pointer items-center justify-center rounded-full border-2 border-cocoa px-4 " +
                      "peer-checked:bg-cocoa peer-checked:text-ivory " +
                      "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-deep " +
                      "peer-disabled:cursor-not-allowed peer-disabled:border-dashed peer-disabled:line-through"
                    }
                  >
                    {optionLabel(group.key, value)}
                    {!available && <span className="ml-1 no-underline">(sold out)</span>}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}