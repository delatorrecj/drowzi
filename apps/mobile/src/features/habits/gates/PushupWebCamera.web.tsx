import { createElement, useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';
import * as poseDetection from '@tensorflow-models/pose-detection';
import type { Keypoint } from '@tensorflow-models/pose-detection';

import { MOVENET_KEYPOINT } from '@/src/features/pushup/movenetTypes';
import type { LeftArmChain } from '@/src/features/pushup/poseTypes';

const LOW_CONF = 0.25;

function leftArmFromMoveNetKeypoints(keypoints: Keypoint[]): LeftArmChain | null {
  const i = MOVENET_KEYPOINT;
  const ls = keypoints[i.leftShoulder];
  const le = keypoints[i.leftElbow];
  const lw = keypoints[i.leftWrist];
  if (!ls || !le || !lw) return null;
  if ((ls.score ?? 0) < LOW_CONF || (le.score ?? 0) < LOW_CONF || (lw.score ?? 0) < LOW_CONF) {
    return null;
  }
  return {
    leftShoulder: { x: ls.x, y: ls.y, z: ls.z, visibility: ls.score },
    leftElbow: { x: le.x, y: le.y, z: le.z, visibility: le.score },
    leftWrist: { x: lw.x, y: lw.y, z: lw.z, visibility: lw.score },
  };
}

export type WebCameraStatus =
  | 'idle'
  | 'loading_model'
  | 'requesting_camera'
  | 'running'
  | 'no_camera'
  | 'no_secure_context'
  | 'model_failed';

type Props = {
  active: boolean;
  onLandmarks: (arm: LeftArmChain | null) => void;
  onStatus?: (status: WebCameraStatus, detail?: string) => void;
};

/**
 * Browser webcam + MoveNet (TF.js) for push-up counting on web.
 * OpenCV is not used: 2D body pose is standard with MoveNet (same family as the native TFLite model).
 * The Kaggle “exercise recognition time series” dataset is IMU/sensor streams, not video—it is not
 * loaded at runtime; training from that data would be an offline pipeline, not in-app OpenCV.
 */
export function PushupWebCamera({ active, onLandmarks, onStatus }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const modelReadyRef = useRef(false);
  const busyRef = useRef(false);
  const [overlay, setOverlay] = useState<string | null>('Starting…');
  const [modelGen, setModelGen] = useState(0);

  const report = useCallback(
    (status: WebCameraStatus, detail?: string) => {
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
        await tf.ready();
        await tf.setBackend('webgl');
        await tf.ready();

        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          },
        );
        if (cancelled) {
          detector.dispose();
          return;
        }
        detectorRef.current = detector;
        modelReadyRef.current = true;
        setModelGen((g) => g + 1);
        report('requesting_camera');
        setOverlay('Requesting camera…');
      } catch (e) {
        if (!cancelled) {
          report('model_failed', e instanceof Error ? e.message : String(e));
          setOverlay('Could not load pose model. Use “Simulate one rep”.');
        }
      }
    })();

    return () => {
      cancelled = true;
      modelReadyRef.current = false;
      detectorRef.current?.dispose?.();
      detectorRef.current = null;
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

    const loop = () => {
      if (stopped) return;
      rafId = requestAnimationFrame(loop);
      const video = videoRef.current;
      const detector = detectorRef.current;
      if (!video || !detector || busyRef.current || video.readyState < 2) return;
      busyRef.current = true;
      void (async () => {
        try {
          const poses = await detector.estimatePoses(video, {
            maxPoses: 1,
            flipHorizontal: true,
          });
          const arm = poses[0] ? leftArmFromMoveNetKeypoints(poses[0].keypoints) : null;
          onLandmarks(arm);
        } catch {
          onLandmarks(null);
        } finally {
          busyRef.current = false;
        }
      })();
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
