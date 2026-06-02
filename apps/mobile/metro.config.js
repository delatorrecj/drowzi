const path = require('path');
const fs = require('fs');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
const upstreamResolveRequest = config.resolver.resolveRequest;

const { assetExts, sourceExts } = config.resolver;

if (!assetExts.includes('tflite')) {
  assetExts.push('tflite');
}

// expo-sqlite web worker imports wa-sqlite.wasm; Metro must bundle it as an asset.
if (!assetExts.includes('wasm')) {
  assetExts.push('wasm');
}
config.resolver.sourceExts = sourceExts.filter((ext) => ext !== 'wasm');

// @mediapipe/tasks-vision uses dynamic import(); load from CDN on web instead of bundling.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === '@mediapipe/tasks-vision') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'src/shims/mediapipe-tasks-vision.web.js'),
    };
  }
  if (
    typeof moduleName === 'string' &&
    moduleName.endsWith('.wasm') &&
    !path.isAbsolute(moduleName)
  ) {
    const candidate = path.normalize(
      path.join(path.dirname(context.originModulePath), moduleName),
    );
    if (fs.existsSync(candidate)) {
      return { type: 'sourceFile', filePath: candidate };
    }
  }
  if (upstreamResolveRequest) {
    return upstreamResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
