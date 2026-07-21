import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import {
  Delegate,
  RunningMode,
  usePoseDetection,
  type DetectionError,
  type ViewCoordinator,
} from 'react-native-mediapipe-posedetection';
import type { RawLandmark } from '@/src/features/exercise/poseAdapter';

import { normalizeMediaPipePose } from '@/src/features/exercise/poseAdapter';
import type { PoseLandmarks33 } from '@/src/features/exercise/landmarks';
import { poseLog } from '@/src/features/exercise/poseDebugLog';

const POSE_MODEL = 'pose_landmarker_full.task';

export type ExerciseCameraStatus =
  | 'idle'
  | 'loading_model'
  | 'requesting_camera'
  | 'running'
  | 'no_camera'
  | 'model_failed';

export type CameraFacing = 'front' | 'back';

type Props = {
  active: boolean;
  facing?: CameraFacing;
  onLandmarks: (landmarks: PoseLandmarks33 | null, trackingLost: boolean) => void;
  onStatus?: (status: ExerciseCameraStatus, detail?: string) => void;
};

/**
 * Native camera + MediaPipe Pose Landmarker (BlazePose 33-pt, same schema as ML Kit).
 */
export function ExerciseCamera({ active, facing = 'front', onLandmarks, onStatus }: Props) {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice(facing);
  const [overlay, setOverlay] = useState<string | null>('Starting…');
  const onLandmarksRef = useRef(onLandmarks);
  onLandmarksRef.current = onLandmarks;
  // View dims the ViewCoordinator maps landmark pixels into; used to renormalize
  // back to 0..1 so overlay + detector keep the normalized-coord contract.
  const viewDimsRef = useRef({ width: 0, height: 0 });

  const report = useCallback(
    (status: ExerciseCameraStatus, detail?: string) => {
      poseLog('status', 0, status, detail ?? '');
      onStatus?.(status, detail);
    },
    [onStatus],
  );

  const handleResults = useCallback((result: unknown, vc: ViewCoordinator) => {
    const bundle = result as {
      inputImageWidth?: number;
      inputImageHeight?: number;
      landmarks?: RawLandmark[][];
      results?: { landmarks?: RawLandmark[][] }[];
    };
    // Log the raw result SHAPE so we can confirm the parse path matches the native
    // module's output. Guarded: JSON.stringify runs per frame otherwise — args
    // evaluate before poseLog's __DEV__ early-return, so this cost hit production.
    if (__DEV__) {
      poseLog('result-shape', 3000, 'keys=', result ? Object.keys(result) : null, 'sample=', JSON.stringify(result)?.slice(0, 300));
    }
    const raw = bundle.landmarks?.[0] ?? bundle.results?.[0]?.landmarks?.[0];
    // ViewCoordinator maps sensor-space normalized points into the upright,
    // mirror-corrected, cover-cropped VIEW — fixes the rotated / offset skeleton
    // AND the torsoVertical/Horizontal validators that were reading rotated coords.
    // Renormalize by view dims to stay in the 0..1 contract the overlay/detector expect.
    const view = viewDimsRef.current;
    const mapped =
      raw && view.width > 0 && view.height > 0
        ? raw.map((lm): RawLandmark => {
            const p = vc.convertPoint(vc.getFrameDims(bundle as never), { x: lm.x, y: lm.y });
            return {
              x: p.x / view.width,
              y: p.y / view.height,
              z: lm.z,
              visibility: lm.visibility ?? lm.presence,
            };
          })
        : raw;
    const normalized = normalizeMediaPipePose(mapped ?? null);
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
      minPoseDetectionConfidence: 0.6,
      minPosePresenceConfidence: 0.6,
      minTrackingConfidence: 0.6,
      delegate: Delegate.GPU,
      mirrorMode: 'mirror-front-only',
      fpsMode: 15,
    },
  );

  viewDimsRef.current = poseDetection.cameraViewDimensions;

  // Tell the pose lib which device is active so its ViewCoordinator knows to
  // mirror front-camera coords to match the mirrored preview.
  const deviceChangeHandler = poseDetection.cameraDeviceChangeHandler;
  useEffect(() => {
    deviceChangeHandler(device);
  }, [device, deviceChangeHandler]);

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
        // MediaPipe requires RGBA_8888 frames; vision-camera defaults to yuv.
        pixelFormat="rgb"
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
