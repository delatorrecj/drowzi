import {
  loadTensorflowModel,
  type Tensor,
  type TfliteModel,
} from 'react-native-fast-tflite';

function tensorElementBytes(dataType: Tensor['dataType']): number {
  switch (dataType) {
    case 'uint8':
    case 'int8':
      return 1;
    case 'float16':
    case 'int16':
      return 2;
    case 'float32':
    case 'int32':
      return 4;
    default:
      return 4;
  }
}

export function getTensorByteLength(tensor: Tensor): number {
  const n = tensor.shape.reduce((a, b) => a * b, 1);
  return n * tensorElementBytes(tensor.dataType);
}

export function allocateModelInputTensor(tensor: Tensor, fill: number = 0): ArrayBuffer {
  const len = getTensorByteLength(tensor);
  const buf = new ArrayBuffer(len);
  if (tensor.dataType === 'uint8' || tensor.dataType === 'int8') {
    new Uint8Array(buf).fill(fill & 0xff);
    return buf;
  }
  if (tensor.dataType === 'float32') {
    new Float32Array(buf).fill(fill);
    return buf;
  }
  new Uint8Array(buf).fill(0);
  return buf;
}

/** Last two spatial dims before channels (handles NHWC). */
export function getMovenetRgbInputSize(model: TfliteModel): { width: number; height: number } {
  const s = model.inputs[0].shape.filter((d) => d > 0);
  if (s.length >= 3) {
    const h = s[s.length - 3]!;
    const w = s[s.length - 2]!;
    return { width: w, height: h };
  }
  return { width: 192, height: 192 };
}

export const movenetLightningTflite = require('../../../assets/models/movenet_lightning_float16.tflite');

export async function loadMovenetLightningModel(): Promise<TfliteModel> {
  return loadTensorflowModel(movenetLightningTflite, []);
}

export async function runMovenet(model: TfliteModel, input: ArrayBuffer): Promise<ArrayBuffer[]> {
  return model.run([input]);
}
