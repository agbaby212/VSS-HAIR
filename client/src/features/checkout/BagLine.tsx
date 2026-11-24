import { Link } from "react-router-dom";
import { Photo } from "../../components/ui/Photo";
import { Button } from "../../components/ui/Button";
import { QuantityStepper } from "../../components/ui/QuantityStepper";
import { MAX_QTY_PER_ITEM } from "../../context/cart";
import { naira } from "../../lib/format";
import type { LiveLine } from "./bagCheck";

type BagLineProps = {
  line: LiveLine;
  onQty: (qty: number) => void;
  onRemove: () => void;
};

// A problem is written in words, on the line, with a bold edge. We do not rely on colour
const problem = "mt-3 border-l-4 border-gold-deep pl-3 font-medium";

export function BagLine({ line, onQty, onRemove }: BagLineProps) {
  const { item, stock } = line;
  // The plus button stops at the live stock when we know it. If the bag already asks for more, plus stays off
  const max = stock === null ? item.maxQty : Math.min(stock, MAX_QTY_PER_ITEM);

  return (
    <li className="flex gap-4 border-b border-sand py-5">
      <Photo src={item.imageUrl ?? undefined} alt="" width={160} height={200} shape="rect" className="w-20 shrink-0 sm:w-24" />

      <div className="min-w-0 flex-1">
        <h2 className="text-lg">
          <Link to={`/shop/${item.productSlug}`} className="underline-offset-4 hover:underline">
            {item.productName}
          </Link>
        </h2>
        {item.variantLabel && <p>{item.variantLabel}</p>}
        <p className="mt-1 font-display text-lg text-gold-deep">{naira(line.priceKobo)}</p>

        {line.status === "gone" ? (
          <p className={problem}>This is no longer available. Remove it to continue.</p>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
              <QuantityStepper value={item.qty} max={max} onChange={onQty} />
              <p className="font-medium">{naira(line.priceKobo * item.qty)}</p>
            </div>

            {line.priceChanged && <p className={problem}>The price changed. It is now {naira(line.priceKobo)} each.</p>}

            {line.tooMany && (
              <div className={problem}>
                {stock === 0 ? (
                  <p>Sold out. Remove it to continue.</p>
                ) : (
                  <>
                    <p>Only {stock} left. Lower the quantity to continue.</p>
                    {stock !== null && (
                      <Button variant="secondary" className="mt-2" onClick={() => onQty(stock)}>
                        Change to {stock}
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}

        <Button variant="secondary" className="mt-3" aria-label={`Remove ${item.productName} from your bag`} onClick={onRemove}>
          Remove
        </Button>
      </div>
    </li>
  );
}