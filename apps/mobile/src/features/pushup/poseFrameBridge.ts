/**
 * Pose pipeline: camera frame → resized RGB tensor → MoveNet → keypoints → push-up machine.
 *
 * Implemented pieces (apps/mobile):
 * - `movenetModel.ts` — bundle + load + `runMovenet`
 * - `movenetKeypoints.ts` — `parseMovenetOutputToLeftArm` → `createPushUpRepMachine().feedLandmarks`
 *
 * Next (native): VisionCamera v5 `useFrameOutput` + a resize step (same aspect as MoveNet input,
 * typically 192×192 uint8 RGB). See react-native-fast-tflite README + vision-camera-resize-plugin.
 */
export { parseMovenetOutputToLeftArm } from '@/src/features/pushup/movenetKeypoints';
export {
  loadMovenetLightningModel,
  movenetLightningTflite,
  runMovenet,
  allocateModelInputTensor,
  getTensorByteLength,
} from '@/src/features/pushup/movenetModel';
