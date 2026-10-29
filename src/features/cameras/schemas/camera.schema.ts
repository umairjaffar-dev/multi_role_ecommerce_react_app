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
