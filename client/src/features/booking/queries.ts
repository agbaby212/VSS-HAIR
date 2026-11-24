import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "../../lib/api";
import { servicesResponseSchema, travelZoneSchema } from "../../shared";

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