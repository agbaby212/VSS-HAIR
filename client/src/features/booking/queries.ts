import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "../../lib/api";
import { bookingSchema, servicesResponseSchema, slotSchema, travelZoneSchema } from "../../shared";
import type { BookingInput } from "./bookingPayload";
import type { SlotParams } from "./bookingDraft";

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
// POST /bookings answers { booking, whatsappUrl } (Section 6). The URL was built by the server from the saved booking
const createBookingResponseSchema = z.object({ booking: bookingSchema, whatsappUrl: z.string().url() });

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    // Same pattern as your useCreateOrder in FE-T6
    mutationFn: (payload: BookingInput) => apiFetch("/bookings", createBookingResponseSchema, { method: "POST", body: payload }),
    // The booked time is no longer free, so every slot list must be fetched again
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["slots"] }),
  });
}

const uploadResponseSchema = z.object({ url: z.string().url() });

export function useUploadInspiration() {
  return useMutation({
    mutationFn: (file: File) => {
      const body = new FormData();
      body.append("file", file); // the field name the server must read (recorded in the handoff for BE-T5)
      return apiFetch("/uploads/inspiration", uploadResponseSchema, { method: "POST", body });
    },
  });
}