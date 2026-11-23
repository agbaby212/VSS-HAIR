import type { FilterOptions } from "../../features/shop/filterOptions";
import { PRICE_IDS, priceLabel, type PriceId, type ShopFilters } from "../../features/shop/shopFilters";
import { Select, type SelectOption } from "../ui/Select";

type FilterPanelProps = {
  filters: ShopFilters;
  options: FilterOptions;
  onChange: (patch: Partial<ShopFilters>) => void;
};

// If the address holds a value that is not in the list (an old link), still show it as chosen,
// otherwise the box would say "Any" while a filter is really on
function withCurrent(list: SelectOption[], current: SelectOption | undefined): SelectOption[] {
  if (!current || list.some((item) => item.value === current.value)) return list;
  return [...list, current];
}

export function FilterPanel({ filters, options, onChange }: FilterPanelProps) {
  const textures = options.textures.map((value) => ({ value, label: value }));
  const colors = options.colors.map((value) => ({ value, label: value }));
  const lengths = options.lengths.map((value) => ({ value: String(value), label: `${value} inch` }));
  const prices = PRICE_IDS.map((id) => ({ value: id, label: priceLabel(id) }));

  return (
    <div className="space-y-5">
      <Select
        label="Texture"
        value={filters.texture ?? ""}
        options={withCurrent(textures, filters.texture ? { value: filters.texture, label: filters.texture } : undefined)}
        onChange={(value) => onChange({ texture: value || undefined })}
      />
      <Select
        label="Length"
        value={filters.length ? String(filters.length) : ""}
        options={withCurrent(lengths, filters.length ? { value: String(filters.length), label: `${filters.length} inch` } : undefined)}
        onChange={(value) => onChange({ length: value ? Number(value) : undefined })}
      />
      <Select
        label="Colour"
        value={filters.color ?? ""}
        options={withCurrent(colors, filters.color ? { value: filters.color, label: filters.color } : undefined)}
        onChange={(value) => onChange({ color: value || undefined })}
      />
      <Select
        label="Price"
        value={filters.price ?? ""}
        options={prices}
        // Only accept a value that is really one of our price ids
        onChange={(value) => onChange({ price: PRICE_IDS.find((id: PriceId) => id === value) })}
      />
    </div>
  );
}