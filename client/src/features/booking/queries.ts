import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "../../lib/api";
import { servicesResponseSchema, travelZoneSchema } from "../../shared";
import { slotSchema } from "../../shared";
import type { SlotParams } from "./bookingDraft";
// (add slotSchema to your existing import from "../../shared" instead of a second import line)

export function useSlots(params: SlotParams | null) {
  return useQuery({
    queryKey: ["slots", params], // Section 9
    queryFn: ({ signal }) => apiFetch("/availability/slots", z.array(slotSchema), { query: params ?? undefined, signal }),
    enabled: params !== null,
    staleTime: 0, // free times change as other customers book
  });
}

export function useServices() {
  return useQuery({
    queryKey: ["services"], // Section 9
    queryFn: ({ signal }) => apiFetch("/services", servicesResponseSchema, { signal }),
  });
}

export function useTravelZones() {
  return useQuery({
    queryKey: ["travel-zones"],
    queryFn: ({ signal }) => apiFetch("/travel-zones", z.array(travelZoneSchema), { signal }),
  });
}