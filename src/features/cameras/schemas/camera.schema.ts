import { z } from "zod";
import {
  createApiListSchema,
  createApiSuccessSchema,
  PageMetaSchema,
} from "@/lib/api/api-response";

/* ===========================================================================
 * Response schemas: mirror backend cameras.service.ts
 * ========================================================================= */

/**
 * Backend `PublicCameraType`. The real RTSP URL never leaves the backend:
 * the admin only sees it with the password masked.
 */
export const CameraSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  location: z.string().nullable(),
  streamPath: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  rtspUrlMasked: z.string(),
  // Where the browser plays the video from (MediaMTX, not the backend)
  hlsUrl: z.url(),
});

export type CameraSchemaType = z.infer<typeof CameraSchema>;

export const CameraListResponseSchema = createApiListSchema(CameraSchema, PageMetaSchema);
export type CameraListResponseSchemaType = z.infer<typeof CameraListResponseSchema>;
export const CameraDetailResponseSchema = createApiSuccessSchema(CameraSchema);

/** Backend `CameraStreamStateType`, see cameraGetStatusService. */
export const CameraStreamStateSchema = z.enum([
  "live",
  "standby",
  "disabled",
  "not_synced",
  "unknown",
]);

export type CameraStreamStateSchemaType = z.infer<typeof CameraStreamStateSchema>;

export const CameraStatusSchema = z.object({
  cameraId: z.uuid(),
  streamPath: z.string(),
  state: CameraStreamStateSchema,
  viewers: z.number().int(),
  liveSince: z.string().nullable(),
  tracks: z.array(z.string()),
  checkedAt: z.string(),
});

export type CameraStatusSchemaType = z.infer<typeof CameraStatusSchema>;

export const CameraStatusResponseSchema = createApiSuccessSchema(CameraStatusSchema);

/* ===========================================================================
 * URL state: grid layout (?cols=1|2|3)
 * ========================================================================= */

export const CameraGridColumnsSchema = z.enum(["1", "2", "3"]).catch("2");

export type CameraGridColumnsSchemaType = z.infer<typeof CameraGridColumnsSchema>;

/* ===========================================================================
 * URL filters for the management table (?page=2&search=gate&isActive=false)
 * ========================================================================= */

export const AdminCameraFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  search: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((value) => (value === "" ? undefined : value))
    .catch(undefined),
  isActive: z.enum(["true", "false"]).optional().catch(undefined),
});

export type AdminCameraFiltersSchemaType = z.infer<typeof AdminCameraFiltersSchema>;

/* ===========================================================================
 * Camera form. Rules mirror backend cameras.validation.ts, so most mistakes are caught
 * before the request; the backend still has the final say (unique / reserved streamPath).
 * ========================================================================= */

// Same rule as the backend StreamPathSchema and the DB check constraint
export const STREAM_PATH_REGEX = /^[a-z0-9][a-z0-9_-]{1,63}$/;

function isRtspUrl(value: string): boolean {
  if (!URL.canParse(value)) return false;
  const { protocol, hostname } = new URL(value);
  return (protocol === "rtsp:" || protocol === "rtsps:") && hostname !== "";
}

// Empty on the edit form means "keep the current URL": the real URL is never sent to the
// browser, so there is nothing to pre-fill. getCameraFormSchema("create") makes it required.
const RtspUrlFieldSchema = z
  .string()
  .trim()
  .max(2048, "RTSP URL must be at most 2048 characters")
  .refine((value) => value === "" || isRtspUrl(value), {
    message: "Enter an rtsp:// or rtsps:// address, e.g. rtsp://user:pass@192.168.1.64:554/stream",
  });

// Empty on the create form means "build it from the name" (see toCameraPayload)
const StreamPathFieldSchema = z
  .string()
  .trim()
  .toLowerCase()
  .refine((value) => value === "" || STREAM_PATH_REGEX.test(value), {
    message:
      "2-64 characters: lowercase letters, numbers, '_' or '-', starting with a letter or number",
  });

export const CameraFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  location: z.string().trim().max(200, "Location must be at most 200 characters"),
  rtspUrl: RtspUrlFieldSchema,
  streamPath: StreamPathFieldSchema,
  isActive: z.boolean(),
});

/**
 * Which fields are required depends on the page. The rule lives on the field itself (not in
 * the submit handler), so an empty form shows every missing field at once.
 */
export function getCameraFormSchema(mode: "create" | "edit") {
  return mode === "create"
    ? CameraFormSchema.extend({
        rtspUrl: RtspUrlFieldSchema.refine((value) => value !== "", "RTSP URL is required"),
      })
    : CameraFormSchema.extend({
        streamPath: StreamPathFieldSchema.refine(
          (value) => value !== "",
          "Stream path is required",
        ),
      });
}

export type CameraFormInputType = z.input<typeof CameraFormSchema>;
export type CameraFormOutputType = z.output<typeof CameraFormSchema>;

export const EMPTY_CAMERA_FORM: CameraFormInputType = {
  name: "",
  location: "",
  rtspUrl: "",
  streamPath: "",
  isActive: true,
};

/** Body for POST /admin/cameras (and, partially, PATCH /admin/cameras/:id). */
export type CameraPayloadType = {
  name: string;
  location: string | null;
  rtspUrl: string;
  streamPath: string;
  isActive: boolean;
};

/** A streamPath suggestion from the name: "Warehouse Gate #2" -> "warehouse-gate-2". */
export function suggestStreamPath(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function toCameraPayload(values: CameraFormOutputType): CameraPayloadType {
  return {
    name: values.name,
    // Empty input clears the location (backend accepts null)
    location: values.location === "" ? null : values.location,
    rtspUrl: values.rtspUrl,
    streamPath: values.streamPath || suggestStreamPath(values.name),
    isActive: values.isActive,
  };
}
