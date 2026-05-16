"use client";

import { useEffect, useRef, useState } from "react";

import { resolvePoseModelPath } from "@/lib/demo/pose/poseModelPath";

export type PoseLandmarkerHandle = {
  detectForVideo: (
    video: HTMLVideoElement,
    timestampMs: number,
  ) => { landmarks: import("@mediapipe/tasks-vision").NormalizedLandmark[][] } | null;
};

export function usePoseLandmarker() {
  const landmarkerRef = useRef<PoseLandmarkerHandle | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setStatus("loading");
      try {
        const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm",
        );
        const modelPath = await resolvePoseModelPath();
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: modelPath,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });

        if (cancelled) {
          landmarker.close();
          return;
        }

        landmarkerRef.current = {
          detectForVideo: (video, timestampMs) => {
            const result = landmarker.detectForVideo(video, timestampMs);
            return result.landmarks?.length
              ? { landmarks: result.landmarks }
              : null;
          },
        };
        setStatus("ready");
      } catch (e) {
        if (!cancelled) {
          setStatus("error");
          setError(e instanceof Error ? e.message : "Failed to load pose model");
        }
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  return { status, error, landmarker: landmarkerRef };
}
