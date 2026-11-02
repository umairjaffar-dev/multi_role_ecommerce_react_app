import type { CameraStreamStateSchemaType } from "../schemas/camera.schema";
import type { PlayerStateType } from "../components/hls-player";

/**
 * Backend states plus "offline", which only the browser can know: with on-demand pulling the
 * backend reports a dead camera as "standby", but a player that tried and failed knows better.
 */
export type CameraDisplayStateType = CameraStreamStateSchemaType | "offline";

/** Combines the backend status with what this page's own player just experienced. */
export function getCameraDisplayState(
  serverState: CameraStreamStateSchemaType | undefined,
  playerState: PlayerStateType | undefined,
): CameraDisplayStateType | undefined {
  if (playerState === "unreachable" && serverState !== "live") return "offline";
  if (playerState === "server_down") return "unknown";
  return serverState;
}
