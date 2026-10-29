import { useEffect, useRef, useState } from "react";
import type Hls from "hls.js";
import type { HlsConfig } from "hls.js";
import { Loader2, RefreshCw, VideoOff } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

export type PlayerStateType = "connecting" | "playing" | "reconnecting" | "unsupported";

// MediaMTX serves Low-Latency HLS by default (1 s segments, 200 ms parts).
const HLS_CONFIG: Partial<HlsConfig> = {
  lowLatencyMode: true,
  // Keep only a little already-played video in memory: a grid runs many players at once.
  backBufferLength: 10,
  // After a stall, play slightly faster to catch up with live instead of drifting behind.
  maxLiveSyncPlaybackRate: 1.5,
};

const RETRY_BASE_MS = 2_000;
const RETRY_MAX_MS = 30_000;

type HlsPlayerPropsType = {
  src: string;
  title: string;
  /** Native controls (fullscreen, picture-in-picture). Off in grid tiles. */
  controls?: boolean;
  className?: string;
  /** Called when playback starts or drops, e.g. to re-check the camera status right away. */
  onStateChange?: (state: PlayerStateType) => void;
};

/**
 * Plays a live HLS stream straight from MediaMTX; the video never passes through the backend.
 *
 * - hls.js (Media Source Extensions) where available, native HLS otherwise (iOS Safari).
 * - hls.js is imported on demand, so pages without video do not download it.
 * - Only plays while on screen: off-screen tiles stop downloading segments, and MediaMTX
 *   can disconnect from an on-demand camera nobody is watching.
 * - A dropped stream (camera offline, MediaMTX restart) reconnects with exponential backoff.
 */
export function HlsPlayer({
  src,
  title,
  controls = false,
  className,
  onStateChange,
}: HlsPlayerPropsType) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { ref: containerRef, isInView } = useInView<HTMLDivElement>("0px");
  const [state, setPlayerState] = useState<PlayerStateType>("connecting");
  // Latest callback without restarting the stream whenever the parent re-renders
  const onStateChangeRef = useRef(onStateChange);
  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isInView) return;

    let hls: Hls | null = null;
    let retryTimer: number | undefined;
    let retries = 0;
    let isDisposed = false;

    const setState = (next: PlayerStateType) => {
      setPlayerState(next);
      onStateChangeRef.current?.(next);
    };

    const detach = () => {
      hls?.destroy();
      hls = null;
      video.removeAttribute("src");
      video.load();
    };

    const scheduleRetry = () => {
      if (isDisposed) return;
      detach();
      setState("reconnecting");
      const delay = Math.min(RETRY_BASE_MS * 2 ** retries, RETRY_MAX_MS);
      retries += 1;
      retryTimer = window.setTimeout(() => void start(), delay);
    };

    const start = async () => {
      const { default: HlsLibrary } = await import("hls.js");
      if (isDisposed) return;
      if (retries === 0) setState("connecting");

      if (HlsLibrary.isSupported()) {
        hls = new HlsLibrary(HLS_CONFIG);
        hls.on(HlsLibrary.Events.ERROR, (_event, data) => {
          // Non-fatal errors (a late segment) are recovered by hls.js itself.
          if (data.fatal) scheduleRetry();
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else {
        setState("unsupported");
        return;
      }

      // Muted autoplay is allowed by every browser; play() can still reject, which is fine.
      video.play().catch(() => undefined);
    };

    const handlePlaying = () => {
      retries = 0;
      setState("playing");
    };
    // Native HLS path reports failures here instead of through hls.js.
    const handleError = () => {
      if (!hls) scheduleRetry();
    };

    video.addEventListener("playing", handlePlaying);
    video.addEventListener("error", handleError);
    void start();

    return () => {
      isDisposed = true;
      window.clearTimeout(retryTimer);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("error", handleError);
      detach();
    };
  }, [src, isInView]);

  return (
    <div
      ref={containerRef}
      className={cn("relative aspect-video overflow-hidden bg-black", className)}
    >
      <video
        ref={videoRef}
        aria-label={title}
        className="size-full object-contain"
        muted
        autoPlay
        playsInline
        controls={controls && state === "playing"}
      />

      {state !== "playing" && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-white/80"
          role="status"
          aria-live="polite"
        >
          {state === "connecting" && (
            <>
              <Loader2 className="size-6 animate-spin" />
              Connecting…
            </>
          )}
          {state === "reconnecting" && (
            <>
              <RefreshCw className="size-6 animate-spin" />
              Stream unavailable, reconnecting…
            </>
          )}
          {state === "unsupported" && (
            <>
              <VideoOff className="size-6" />
              This browser cannot play live video.
            </>
          )}
        </div>
      )}
    </div>
  );
}
