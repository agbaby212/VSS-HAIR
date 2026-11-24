import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChangeEvent } from "react";
import { useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import type { z } from "zod";
import { SelectField, TextAreaField, TextField } from "../../components/ui/FormFields";
import { Button } from "../../components/ui/Button";
import { ErrorNotice } from "../../components/ui/ErrorNotice";
import { useCart } from "../../context/useCart";
import { ApiError, apiFetch } from "../../lib/api";
import { naira } from "../../lib/format";
import { isWhatsappUrl } from "../../lib/whatsapp";
import { checkoutSchema, createOrderResponseSchema, type CheckoutInput } from "../../shared";
import { useDeliveryZones, usePublicSettings } from "../shop/queries";
import { canCheckout, type LiveLine } from "./bagCheck";
import { saveLastOrder } from "./lastOrder";
import { OrderSummary } from "./OrderSummary";
import { buildOrderPayload, deliveryEtaText } from "./orderPayload";

type FormValues = z.input<typeof checkoutSchema>; // what the boxes hold

const FIELD_NAMES = ["customerName", "phone", "fulfilment", "state", "city", "address", "notes"] as const;
type FieldName = (typeof FIELD_NAMES)[number];
const isFieldName = (value: string): value is FieldName => (FIELD_NAMES as readonly string[]).includes(value);

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

function FulfilmentOption({ field, value, title, text }: { field: UseFormRegisterReturn; value: string; title: string; text: string }) {
  return (
    <label className="block">
      {/* A real radio, hidden but focusable. The box after it is what people see (same trick as the variant buttons) */}
      <input type="radio" value={value} className="peer sr-only" {...field} />
      <span
        className={
          "block min-h-[2.75rem] cursor-pointer border-2 border-cocoa p-4 " +
          "peer-checked:bg-cocoa peer-checked:text-ivory " +
          "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-deep"
        }
      >
        <span className="block font-medium">{title}</span>
        <span className="block text-sm">{text}</span>
      </span>
    </label>
  );
}

type CheckoutFormProps = {
  lines: LiveLine[]; // the bag, checked against the shop (part 1)
  onPlaced: () => void; // tells the page an order was made, so it does not bounce us to the bag when it empties
};

export function CheckoutForm({ lines, onPlaced }: CheckoutFormProps) {
  const { items, clear } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const zones = useDeliveryZones();
  const settings = usePublicSettings();

  const { control, register, handleSubmit, setValue, setError, clearErrors, formState: { errors } } = useForm<
    FormValues,
    unknown,
    CheckoutInput
  >({
    resolver: zodResolver(checkoutSchema),
    mode: "onTouched", // check a box after the customer leaves it, then on every change
    defaultValues: {
      customerName: "",
      phone: "",
      fulfilment: "delivery",
      // state, city, address and notes start as undefined on purpose (see the concept above)
      items: items.map(({ variantId, qty }) => ({ variantId, qty })),
    },
  });

  const fulfilment = useWatch({ control, name: "fulfilment" });
  const stateName = useWatch({ control, name: "state" });
  const zone = zones.data?.find((candidate) => candidate.state === stateName);
  // null = delivery but no state chosen yet
  const deliveryFeeKobo = fulfilment === "pickup" ? 0 : zone ? zone.feeKobo : null;

  const placeOrder = useMutation({
    mutationFn: (payload: CheckoutInput) => apiFetch("/orders", createOrderResponseSchema, { method: "POST", body: payload }),
    onSuccess: (result) => {
      saveLastOrder(result); // 1. keep it first, so the confirmation page always has it
      onPlaced();
      void queryClient.invalidateQueries({ queryKey: ["products"] }); // stock just changed
      void queryClient.invalidateQueries({ queryKey: ["product"] });
      navigate(`/order/${result.order.orderNumber}`); // 2. go to the confirmation page
      clear(); // 3. only now empty the bag: the server said yes
      // Open the chat. Some phones block this because it follows a network call; the confirmation page has a button for that
      if (isWhatsappUrl(result.whatsappUrl)) window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
    },
    onError: (error) => {
      // If the server names a field, show the message under that field
      if (error instanceof ApiError) {
        for (const detail of error.details) {
          const field = detail.path.split(".")[0];
          if (isFieldName(field)) setError(field, { message: detail.message });
        }
      }
    },
  });

  function handleFulfilmentChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.value === "pickup") {
      // Forget a half-typed address, so a hidden box can never block the order
      setValue("state", undefined);
      setValue("city", undefined);
      setValue("address", undefined);
      clearErrors(["state", "city", "address"]);
    }
  }

  const onSubmit = (data: CheckoutInput) => placeOrder.mutate(buildOrderPayload(data, items));

  const ready = canCheckout(lines);
  const checking = lines.some((line) => line.status === "checking");
  const sendError = placeOrder.error;
  const itemProblem = sendError instanceof ApiError && (sendError.code === "OUT_OF_STOCK" || sendError.code === "NOT_FOUND");
  const holdHours = settings.data?.orderHoldHours;

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-6 lg:grid lg:grid-cols-[1fr_24rem] lg:items-start lg:gap-12">
      <div className="space-y-8">
        <fieldset className="space-y-4">
          <legend className="mb-3 font-display text-2xl">Your details</legend>
          <TextField
            label="Full name"
            autoComplete="name"
            error={errors.customerName?.message}
            {...register("customerName")}
          />
          <TextField
            label="Phone number"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            hint="We use it to reach you on WhatsApp and to find your order later."
            error={errors.phone?.message}
            {...register("phone")}
          />
        </fieldset>

        <fieldset>
          <legend className="mb-3 font-display text-2xl">How do you want your order?</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <FulfilmentOption
              field={register("fulfilment", { onChange: handleFulfilmentChange })}
              value="delivery"
              title="Delivery"
              text="We send it to your address."
            />
            <FulfilmentOption
              field={register("fulfilment", { onChange: handleFulfilmentChange })}
              value="pickup"
              title="Pickup"
              text="You collect it yourself. No delivery fee."
            />
          </div>
        </fieldset>

        {fulfilment === "delivery" ? (
          <fieldset className="space-y-4">
            <legend className="mb-3 font-display text-2xl">Delivery address</legend>

            {zones.isError ? (
              <ErrorNotice error={zones.error} onRetry={() => void zones.refetch()} title="We could not load the delivery states" />
            ) : (
              <SelectField
                label="State"
                autoComplete="address-level1"
                placeholder={zones.isPending ? "Loading states" : "Choose your state"}
                options={(zones.data ?? []).map((item) => ({ value: item.state, label: item.state }))}
                error={errors.state?.message}
                {...register("state", { setValueAs: emptyToUndefined })}
              />
            )}
            {/* role="status": the fee is read aloud when the state changes */}
            <p role="status" className="min-h-[1.5rem]">
              {zone && (
                <>
                  Delivery fee <strong>{naira(zone.feeKobo)}</strong>. Estimated delivery time: {deliveryEtaText(zone)}.
                </>
              )}
            </p>

            <TextField label="City or town" autoComplete="address-level2" error={errors.city?.message} {...register("city", { setValueAs: emptyToUndefined })} />
            <TextField
              label="Street address"
              autoComplete="street-address"
              hint="House number, street and a landmark if you can."
              error={errors.address?.message}
              {...register("address", { setValueAs: emptyToUndefined })}
            />
          </fieldset>
        ) : (
          <section aria-labelledby="pickup-title">
            <h2 id="pickup-title" className="mb-3 font-display text-2xl">
              Pickup
            </h2>
            <p>Collect from: {settings.data?.business.address ?? "..."}</p>
            <p className="mt-1">Opening hours: {settings.data?.business.hoursText ?? "..."}</p>
          </section>
        )}

        <TextAreaField
          label="Note for the owner (optional)"
          maxLength={500}
          error={errors.notes?.message}
          {...register("notes", { setValueAs: emptyToUndefined })}
        />
      </div>

      <div className="mt-8 space-y-5 lg:mt-0">
        <OrderSummary lines={lines} fulfilment={fulfilment} deliveryFeeKobo={deliveryFeeKobo} />

        {!ready && !checking && (
          <div role="alert" className="border-l-4 border-gold-deep pl-3 font-medium">
            Some items in your bag need attention.{" "}
            <Link to="/cart" className="text-gold-deep underline underline-offset-4">
              Go to your bag
            </Link>
          </div>
        )}

        {sendError && (
          <div>
            <ErrorNotice error={sendError} title="We could not send your order" />
            {itemProblem && (
              <p className="mt-2">
                <Link to="/cart" className="text-gold-deep underline underline-offset-4">
                  Go back to your bag
                </Link>{" "}
                to fix it. Nothing has been lost.
              </p>
            )}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" loading={placeOrder.isPending} loadingText="Sending your order" disabled={!ready}>
          Send order on WhatsApp
        </Button>

        <section aria-labelledby="next-title" className="max-w-prose">
          <h2 id="next-title" className="text-xl">
            What happens next
          </h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>We save your order and open WhatsApp with your order message ready.</li>
            <li>Send that message to the owner.</li>
            <li>Wait for her reply with her account details, then pay by bank transfer.</li>
          </ol>
          <p className="mt-3 text-sm">
            This site never takes payment.
            {holdHours ? ` We keep your items for ${holdHours} hours while you pay.` : ""}
          </p>
        </section>
      </div>
    </form>
  );
}