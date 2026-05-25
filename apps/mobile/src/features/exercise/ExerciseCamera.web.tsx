import { createElement, useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { normalizeMediaPipePose } from '@/src/features/exercise/poseAdapter';
import type { PoseLandmarks33 } from '@/src/features/exercise/landmarks';
import {
  loadMediaPipeVision,
  type PoseLandmarkerInstance,
} from '@/src/features/exercise/mediapipeWebLoader';

export type ExerciseCameraStatus =
  | 'idle'
  | 'loading_model'
  | 'requesting_camera'
  | 'running'
  | 'no_camera'
  | 'no_secure_context'
  | 'model_failed';

type Props = {
  active: boolean;
  onLandmarks: (landmarks: PoseLandmarks33 | null, trackingLost: boolean) => void;
  onStatus?: (status: ExerciseCameraStatus, detail?: string) => void;
};

const WASM_BASE =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task';

/**
 * Browser webcam + MediaPipe Pose Landmarker (BlazePose 33-pt).
 * MediaPipe is loaded from CDN — not bundled — to avoid Metro dynamic-import errors.
 */
export function ExerciseCamera({ active, onLandmarks, onStatus }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const landmarkerRef = useRef<PoseLandmarkerInstance | null>(null);
  const modelReadyRef = useRef(false);
  const busyRef = useRef(false);
  const [overlay, setOverlay] = useState<string | null>('Starting…');
  const [modelGen, setModelGen] = useState(0);

  const report = useCallback(
    (status: ExerciseCameraStatus, detail?: string) => {
      onStatus?.(status, detail);
    },
    [onStatus],
  );

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    (async () => {
      try {
        report('loading_model');
        setOverlay('Loading pose model…');
        const { FilesetResolver, PoseLandmarker } = await loadMediaPipeVision();
        const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        if (cancelled) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;
        modelReadyRef.current = true;
        setModelGen((g) => g + 1);
        report('requesting_camera');
        setOverlay('Requesting camera…');
      } catch (e) {
        if (!cancelled) {
          report('model_failed', e instanceof Error ? e.message : String(e));
          setOverlay('Could not load pose model. Use simulate below.');
        }
      }
    })();

    return () => {
      cancelled = true;
      modelReadyRef.current = false;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, [active, report]);

  useEffect(() => {
    if (!active || typeof window === 'undefined' || typeof navigator === 'undefined') return;

    if (!window.isSecureContext && !window.location.hostname.includes('localhost')) {
      report('no_secure_context');
      setOverlay('Camera needs HTTPS (or localhost).');
      return;
    }

    let cancelled = false;
    let stream: MediaStream | null = null;

    const attach = async () => {
      if (!modelReadyRef.current || cancelled) return;
      let video = videoRef.current;
      if (!video) {
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
        video = videoRef.current;
      }
      if (!video || cancelled) return;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        video.srcObject = stream;
        await video.play().catch(() => undefined);
        report('running');
        setOverlay(null);
      } catch {
        if (!cancelled) {
          report('no_camera');
          setOverlay('Camera permission denied or unavailable.');
        }
      }
    };

    void attach();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
      const v = videoRef.current;
      if (v?.srcObject instanceof MediaStream) {
        v.srcObject.getTracks().forEach((t) => t.stop());
        v.srcObject = null;
      }
    };
  }, [active, modelGen, report]);

  useEffect(() => {
    if (!active || !modelReadyRef.current) return;

    let stopped = false;
    let rafId = 0;
    let lastVideoTime = -1;

    const loop = () => {
      if (stopped) return;
      rafId = requestAnimationFrame(loop);
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;
      if (!video || !landmarker || busyRef.current || video.readyState < 2) return;
      if (video.currentTime === lastVideoTime) return;
      lastVideoTime = video.currentTime;
      busyRef.current = true;
      try {
        const result = landmarker.detectForVideo(video, performance.now());
        const raw = result.landmarks?.[0]?.map((lm) => ({
          x: lm.x,
          y: lm.y,
          z: lm.z,
          visibility: lm.visibility,
        }));
        const normalized = normalizeMediaPipePose(raw ?? null);
        onLandmarks(normalized, !normalized);
      } catch {
        onLandmarks(null, true);
      } finally {
        busyRef.current = false;
      }
    };

    rafId = requestAnimationFrame(loop);
    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
    };
  }, [active, modelGen, onLandmarks]);

  if (!active) return null;

  return (
    <View style={styles.wrap}>
      {createElement('video', {
        ref: videoRef,
        autoPlay: true,
        playsInline: true,
        muted: true,
        style: styles.video as unknown as CSSProperties,
      })}
      {overlay ? (
        <View style={styles.overlay} pointerEvents="none">
          <Text style={styles.overlayText}>{overlay}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: [{ scaleX: -1 }],
  } as object,
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  overlayText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});
