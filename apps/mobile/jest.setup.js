jest.mock('react-native-vision-camera', () => ({
  Camera: 'RCTCamera',
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

jest.mock('react-native-fast-tflite', () => ({
  loadTensorflowModel: jest.fn(),
  useTensorflowModel: () => ({
    state: 'error',
    model: undefined,
    error: new Error('mock'),
  }),
}));
