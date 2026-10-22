export const REDIRECT_PARAM = "redirectTo";

/**
 * Prevents open redirects: `/login?redirectTo=https://evil.com` must not send a freshly
 * logged-in user to another site. Only same-app relative paths are allowed.
 * "//evil.com" and "/\evil.com" are protocol-relative URLs in browsers, so they are rejected too.
 */
export function getSafeRedirectPath(value: string | null, fallback = "/"): string {
  if (!value?.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}

/** Builds `/login?redirectTo=<current path>` so the user returns where they were. */
export function buildLoginPath(requestUrl: string): string {
  const url = new URL(requestUrl);
  const params = new URLSearchParams({ [REDIRECT_PARAM]: url.pathname + url.search });
  return `/login?${params.toString()}`;
}
