import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "../../lib/api";
import { trackedOrderSchema, type TrackOrderInput } from "../../shared";

// A mutation, not a query: the answer holds a changing status and is looked up with a private phone number,
// so we never want it in a cache or in a query key
export function useTrackOrder() {
  return useMutation({
    mutationFn: (input: TrackOrderInput) => apiFetch("/orders/track", trackedOrderSchema, { method: "POST", body: input }),
  });
}