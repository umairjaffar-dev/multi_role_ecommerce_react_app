import axios from "axios";
import { z } from "zod";

/**
 * Mirrors the backend error envelope:
 * { success: false, error: { code, message, details? } }
 */
export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

export type ApiErrorResponseSchemaType = z.infer<typeof ApiErrorResponseSchema>;

/**
 * Normalised error thrown by the API layer.
 * UI code checks `code` (e.g. "INVALID_CREDENTIALS") instead of parsing Axios internals.
 */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number | null;
  readonly details: unknown;

  constructor(params: { code: string; message: string; status: number | null; details?: unknown }) {
    super(params.message);
    this.name = "ApiError";
    this.code = params.code;
    this.status = params.status;
    this.details = params.details;
  }
}

/** Converts any thrown value into an ApiError so callers handle one shape. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? null;
    const parsed = ApiErrorResponseSchema.safeParse(error.response?.data);

    if (parsed.success) {
      return new ApiError({
        code: parsed.data.error.code,
        message: parsed.data.error.message,
        status,
        details: parsed.data.error.details,
      });
    }

    if (!error.response) {
      return new ApiError({
        code: "NETWORK_ERROR",
        message: "Unable to reach the server. Please check your connection.",
        status: null,
      });
    }

    return new ApiError({ code: "UNKNOWN_ERROR", message: error.message, status });
  }

  if (error instanceof Error) {
    return new ApiError({ code: "UNKNOWN_ERROR", message: error.message, status: null });
  }

  return new ApiError({ code: "UNKNOWN_ERROR", message: "Something went wrong.", status: null });
}

/** User-facing message for toasts and inline error states. */
export function getErrorMessage(error: unknown): string {
  return toApiError(error).message;
}
