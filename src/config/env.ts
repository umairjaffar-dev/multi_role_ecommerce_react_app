import { z } from "zod";

/**
 * Validates Vite env variables once at startup.
 * A missing or malformed variable fails fast with a clear message
 * instead of surfacing later as a confusing network error.
 */
const EnvSchema = z.object({
  VITE_API_BASE_URL: z.string().min(1).default("/api/v1"),
  VITE_APP_NAME: z.string().min(1).default("E-Commerce Store"),
  DEV: z.boolean(),
  PROD: z.boolean(),
});

type EnvSchemaType = z.infer<typeof EnvSchema>;

const parseResult = EnvSchema.safeParse(import.meta.env);

if (!parseResult.success) {
  throw new Error(`Invalid environment variables:\n${z.prettifyError(parseResult.error)}`);
}

export const env: EnvSchemaType = parseResult.data;
