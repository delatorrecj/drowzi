import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import {
  Delegate,
  RunningMode,
  usePoseDetection,
  type DetectionError,
} from 'react-native-mediapipe-posedetection';
import type { RawLandmark } from '@/src/features/exercise/poseAdapter';

import { normalizeMediaPipePose } from '@/src/features/exercise/poseAdapter';
import type { PoseLandmarks33 } from '@/src/features/exercise/landmarks';

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
  const device = useCameraDevice('front');
  const [overlay, setOverlay] = useState<string | null>('Starting…');
  const onLandmarksRef = useRef(onLandmarks);
  onLandmarksRef.current = onLandmarks;

  const report = useCallback(
    (status: ExerciseCameraStatus, detail?: string) => {
      onStatus?.(status, detail);
    },
    [onStatus],
  );

  const handleResults = useCallback((result: unknown) => {
    const bundle = result as {
      landmarks?: RawLandmark[][];
      results?: { landmarks?: RawLandmark[][] }[];
    };
    const raw = bundle.landmarks?.[0] ?? bundle.results?.[0]?.landmarks?.[0];
    const normalized = normalizeMediaPipePose(raw ?? null);
    onLandmarksRef.current(normalized, !normalized);
  }, []);

  const handleError = useCallback(
    (error: DetectionError) => {
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
    if (!device) {
      report('no_camera');
      setOverlay('Camera unavailable.');
      return;
    }
    report('running');
    setOverlay(null);
  }, [active, device, report]);

  if (!active) return null;

  if (!device) {
    return (
      <View style={styles.wrap}>
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Camera permission denied or unavailable.</Text>
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
