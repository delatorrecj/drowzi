import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import {
  Delegate,
  RunningMode,
  usePoseDetection,
  type DetectionError,
} from 'react-native-mediapipe-posedetection';
import type { RawLandmark } from '@/src/features/exercise/poseAdapter';

import { normalizeMediaPipePose } from '@/src/features/exercise/poseAdapter';
import type { PoseLandmarks33 } from '@/src/features/exercise/landmarks';
import { poseLog } from '@/src/features/exercise/poseDebugLog';

const POSE_MODEL = 'pose_landmarker_lite.task';

export type ExerciseCameraStatus =
  | 'idle'
  | 'loading_model'
  | 'requesting_camera'
  | 'running'
  | 'no_camera'
  | 'model_failed';

type Props = {
  active: boolean;
  onLandmarks: (landmarks: PoseLandmarks33 | null, trackingLost: boolean) => void;
  onStatus?: (status: ExerciseCameraStatus, detail?: string) => void;
};

/**
 * Native camera + MediaPipe Pose Landmarker (BlazePose 33-pt, same schema as ML Kit).
 */
export function ExerciseCamera({ active, onLandmarks, onStatus }: Props) {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const [overlay, setOverlay] = useState<string | null>('Starting…');
  const onLandmarksRef = useRef(onLandmarks);
  onLandmarksRef.current = onLandmarks;

  const report = useCallback(
    (status: ExerciseCameraStatus, detail?: string) => {
      poseLog('status', 0, status, detail ?? '');
      onStatus?.(status, detail);
    },
    [onStatus],
  );

  const handleResults = useCallback((result: unknown) => {
    const bundle = result as {
      landmarks?: RawLandmark[][];
      results?: { landmarks?: RawLandmark[][] }[];
    };
    // Log the raw result SHAPE once so we can confirm the parse path matches the
    // native module's output (landmarks[] vs results[].landmarks[]).
    poseLog('result-shape', 3000, 'keys=', result ? Object.keys(result) : null, 'sample=', JSON.stringify(result)?.slice(0, 300));
    const raw = bundle.landmarks?.[0] ?? bundle.results?.[0]?.landmarks?.[0];
    const normalized = normalizeMediaPipePose(raw ?? null);
    poseLog('results', 1000, 'frameLandmarks=', raw?.length ?? 0, 'normalized=', normalized ? `${normalized.length}pts` : 'NULL');
    onLandmarksRef.current(normalized, !normalized);
  }, []);

  const handleError = useCallback(
    (error: DetectionError) => {
      poseLog('error', 0, error.message);
      report('model_failed', error.message);
      setOverlay('Could not run pose detection.');
      onLandmarksRef.current(null, true);
    },
    [report],
  );

  const poseDetection = usePoseDetection(
    {
      onResults: handleResults,
      onError: handleError,
    },
    RunningMode.LIVE_STREAM,
    POSE_MODEL,
    {
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
      delegate: Delegate.GPU,
      mirrorMode: 'mirror-front-only',
      fpsMode: 15,
    },
  );

  useEffect(() => {
    if (!active) return;
    report('loading_model');
    setOverlay('Loading pose model…');
  }, [active, report]);

  useEffect(() => {
    if (!active) return;
    if (!hasPermission) {
      report('requesting_camera');
      setOverlay('Requesting camera permission…');
      requestPermission().then((granted) => {
        if (!granted) {
          report('no_camera');
          setOverlay('Camera permission denied.');
        }
      });
      return;
    }
    if (!device) {
      report('no_camera');
      setOverlay('Camera unavailable.');
      return;
    }
    report('running');
    poseLog('camera', 0, 'permission=', hasPermission, 'device=', device?.name ?? 'none', 'frameProcessor=', !!poseDetection.frameProcessor);
    setOverlay(null);
  }, [active, hasPermission, requestPermission, device, report, poseDetection.frameProcessor]);

  if (!active) return null;

  if (!hasPermission) {
    return (
      <View style={styles.wrap}>
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Camera permission is required to continue.</Text>
        </View>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.wrap}>
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Camera unavailable.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={active}
        frameProcessor={poseDetection.frameProcessor}
        onLayout={poseDetection.cameraViewLayoutChangeHandler}
        onOutputOrientationChanged={poseDetection.cameraOrientationChangedHandler}
      />
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
