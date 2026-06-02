jest.mock('react-native-vision-camera', () => ({
  Camera: 'RCTCamera',
  useCameraDevice: () => ({ id: 'mock-front', position: 'front' }),
  useCameraPermission: () => ({
    hasPermission: true,
    canRequestPermission: false,
    requestPermission: jest.fn(async () => true),
  }),
  useMicrophonePermission: () => ({
    hasPermission: false,
    canRequestPermission: false,
    requestPermission: jest.fn(async () => false),
  }),
}));

jest.mock('react-native-mediapipe-posedetection', () => ({
  Delegate: { GPU: 'GPU', CPU: 'CPU' },
  RunningMode: { LIVE_STREAM: 'LIVE_STREAM' },
  usePoseDetection: () => ({
    frameProcessor: jest.fn(),
    cameraViewLayoutChangeHandler: jest.fn(),
    cameraOrientationChangedHandler: jest.fn(),
  }),
}));
