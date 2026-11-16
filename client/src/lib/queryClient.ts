import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // data is "fresh" for 30s, so going back to a page does not refetch at once
      refetchOnWindowFocus: false, // phones switch apps all the time; we do not want a refetch each time
      retry: (failureCount, error) => {
        // A 4xx (not found, validation, unauthorised) will fail again, so do not retry it
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
        return failureCount < 2; // network errors and 5xx: two more tries
      },
    },
    mutations: {
      retry: false, // never repeat a "create order" by accident
    },
  },
});