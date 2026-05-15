import { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import type { TfliteModel } from 'react-native-fast-tflite';
import {
  Camera,
  CommonResolutions,
  useFrameOutput,
  type Frame,
} from 'react-native-vision-camera';
import { runOnJS } from 'react-native-worklets';
import { useResizePlugin } from 'vision-camera-resize-plugin';

type Props = {
  model: TfliteModel;
  inputWidth: number;
  inputHeight: number;
  isActive: boolean;
  onMovenetOutput: (buffer: ArrayBuffer) => void;
};

/**
 * Front camera + MoveNet SinglePose Lightning via frame output (worklet).
 * Resizes each frame to the model's expected RGB uint8 tensor.
 */
export function PushupMovenetCamera({
  model,
  inputWidth,
  inputHeight,
  isActive,
  onMovenetOutput,
}: Props) {
  const { resize: resizeFrame } = useResizePlugin();

  const onFrame = useCallback(
    (frame: Frame) => {
      'worklet';
      try {
        const resized = resizeFrame(frame, {
          scale: { width: inputWidth, height: inputHeight },
          pixelFormat: 'rgb',
          dataType: 'uint8',
          mirror: true,
        });
        const slice = resized.buffer.slice(
          resized.byteOffset,
          resized.byteOffset + resized.byteLength,
        );
        const inputBuffer = slice as ArrayBuffer;
        const outputs = model.runSync([inputBuffer]);
        const first = outputs[0];
        if (first) {
          const u8 = new Uint8Array(first);
          const copy = new Uint8Array(u8.byteLength);
          copy.set(u8);
          runOnJS(onMovenetOutput)(copy.buffer);
        }
      } finally {
        frame.dispose();
      }
    },
    [model, inputWidth, inputHeight, resizeFrame, onMovenetOutput],
  );

  const frameOutput = useFrameOutput({
    targetResolution: CommonResolutions.VGA_16_9,
    pixelFormat: 'rgb',
    enablePreviewSizedOutputBuffers: true,
    dropFramesWhileBusy: true,
    onFrame,
  });

  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device="front"
      isActive={isActive}
      outputs={[frameOutput]}
    />
  );
}
