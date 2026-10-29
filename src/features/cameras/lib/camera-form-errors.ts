import type { CameraFormInputType } from "../schemas/camera.schema";

/**
 * How backend errors land on the camera form. A taken or reserved streamPath appears
 * under that input; MEDIA_SERVER_UNAVAILABLE (502) and anything else shows above the button.
 */
export const CAMERA_FORM_ERROR_MAPPING = {
  fields: ["name", "location", "rtspUrl", "streamPath", "isActive"],
  codeToField: {
    CAMERA_STREAM_PATH_EXISTS: "streamPath",
    CAMERA_STREAM_PATH_RESERVED: "streamPath",
  },
} as const satisfies {
  fields: ReadonlyArray<keyof CameraFormInputType>;
  codeToField: Partial<Record<string, keyof CameraFormInputType>>;
};
