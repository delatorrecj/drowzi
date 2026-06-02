/** Loaded from CDN at runtime — avoids Metro bundling vision_bundle.mjs dynamic imports. */
export type MediaPipeVision = {
  FilesetResolver: {
    forVisionTasks: (wasmPath: string) => Promise<unknown>;
  };
  PoseLandmarker: {
    createFromOptions: (
      vision: unknown,
      options: Record<string, unknown>,
    ) => Promise<PoseLandmarkerInstance>;
  };
};

export type PoseLandmarkerInstance = {
  detectForVideo: (
    video: HTMLVideoElement,
    timestamp: number,
  ) => {
    landmarks?: { x: number; y: number; z?: number; visibility?: number }[][];
  };
  close: () => void;
};

declare global {
  interface Window {
    __drowziMediaPipeVision?: MediaPipeVision;
  }
}

const MEDIAPIPE_VERSION = '0.10.35';
const READY_EVENT = 'drowzi-mediapipe-vision-ready';

let loadPromise: Promise<MediaPipeVision> | null = null;

export function loadMediaPipeVision(): Promise<MediaPipeVision> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('MediaPipe web loader requires a browser'));
      return;
    }

    if (window.__drowziMediaPipeVision) {
      resolve(window.__drowziMediaPipeVision);
      return;
    }

    const onReady = () => {
      const mod = window.__drowziMediaPipeVision;
      if (mod) resolve(mod);
      else reject(new Error('MediaPipe module missing after CDN load'));
    };

    window.addEventListener(READY_EVENT, onReady, { once: true });

    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = `
      import { FilesetResolver, PoseLandmarker } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/+esm';
      window.__drowziMediaPipeVision = { FilesetResolver, PoseLandmarker };
      window.dispatchEvent(new Event('${READY_EVENT}'));
    `;
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Failed to load MediaPipe tasks-vision from CDN'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
