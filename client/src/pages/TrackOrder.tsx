import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";
import { Button } from "../components/ui/Button";
import { ErrorNotice } from "../components/ui/ErrorNotice";
import { TextField } from "../components/ui/FormFields";
import { useTrackOrder } from "../features/tracking/queries";
import { TrackedOrderView } from "../features/tracking/TrackedOrderView";
import { ApiError } from "../lib/api";
import { trackOrderSchema, type TrackOrderInput } from "../shared";

// The shared schema, plus a "required" message for the form only
const trackFormSchema = trackOrderSchema.extend({
  orderNumber: z.string().trim().toUpperCase().min(1, "Enter your order number, like VSS-10482"),
});
type FormValues = z.input<typeof trackFormSchema>;

export default function TrackOrder() {
  const [params] = useSearchParams();
  const track = useTrackOrder();
  const resultRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues, unknown, TrackOrderInput>({
    resolver: zodResolver(trackFormSchema),
    // The order number may come from the address (/track?order=VSS-10482). The phone never does
    defaultValues: { orderNumber: (params.get("order") ?? "").slice(0, 30), phone: "" },
  });

  // When an answer arrives, move the keyboard focus to it so a screen reader reads it out
  useEffect(() => {
    if (track.data) resultRef.current?.focus();
  }, [track.data]);

  const notFound = track.error instanceof ApiError && track.error.status === 404;

  function checkAnother() {
    track.reset();
    reset({ orderNumber: "", phone: "" });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl">Track your order</h1>
      <p className="mt-2 max-w-prose">Enter the order number from your confirmation and the phone number you gave us.</p>

      {track.data ? (
        <div ref={resultRef} tabIndex={-1} className="mt-8 outline-none">
          <TrackedOrderView order={track.data} />
          <Button variant="secondary" className="mt-8" onClick={checkAnother}>
            Check another order
          </Button>
        </div>
      ) : (
        <form noValidate onSubmit={handleSubmit((data) => track.mutate(data))} className="mt-6 max-w-md space-y-4">
          <TextField
            label="Order number"
            autoComplete="off"
            autoCapitalize="characters"
            hint="It looks like VSS-10482."
            error={errors.orderNumber?.message}
            {...register("orderNumber")}
          />
          <TextField
            label="Phone number"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            error={errors.phone?.message}
            {...register("phone")}
          />

          {track.error && (
            <ErrorNotice
              error={track.error}
              title={notFound ? "We could not find your order" : "We could not check your order"}
            />
          )}

          <Button type="submit" size="lg" loading={track.isPending} loadingText="Checking your order">
            Track order
          </Button>
        </form>
      )}
    </div>
  );
}