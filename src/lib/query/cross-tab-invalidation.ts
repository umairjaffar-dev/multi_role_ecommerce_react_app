import type { QueryClient, QueryKey } from "@tanstack/react-query";

/*
 * Each browser tab has its own in-memory TanStack Query cache. When an admin saves a product
 * in one tab, a storefront tab open next to it would keep showing the old list.
 * After a write, the query key is broadcast to every other tab of this site, and each tab
 * invalidates the same key in its own cache (refetching it if it is on screen).
 */

const channel =
  typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel("query-invalidation");

/** Invalidate in this tab and tell every other open tab to do the same. */
export async function invalidateQueriesEverywhere(
  queryClient: QueryClient,
  queryKey: QueryKey,
): Promise<void> {
  channel?.postMessage(queryKey);
  await queryClient.invalidateQueries({ queryKey });
}

/** Called once at startup: apply invalidations broadcast by other tabs. */
export function listenForCrossTabInvalidation(queryClient: QueryClient): () => void {
  if (!channel) return () => undefined;

  const listener = (message: MessageEvent<unknown>) => {
    if (Array.isArray(message.data)) {
      void queryClient.invalidateQueries({ queryKey: message.data as QueryKey });
    }
  };
  channel.addEventListener("message", listener);
  return () => {
    channel.removeEventListener("message", listener);
  };
}
