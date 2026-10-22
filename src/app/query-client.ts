import { QueryClient } from "@tanstack/react-query";
import { toApiError } from "@/lib/api/api-error";

const MAX_QUERY_RETRIES = 2;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Product/catalog data changes rarely; 1 minute avoids refetching on every mount.
      staleTime: 60_000,
      // Retry network/5xx errors only. A 4xx (404, 403, validation) will not succeed on retry.
      retry: (failureCount, error) => {
        const { status } = toApiError(error);
        if (status !== null && status >= 400 && status < 500) return false;
        return failureCount < MAX_QUERY_RETRIES;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
